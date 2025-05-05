CREATE PROCEDURE SEI_Tracking
(
	IN tenant_code NVARCHAR(50),				-- Tenant Code
	IN tenant_db NVARCHAR(50),					-- Tenant DB
    IN object_type NVARCHAR(20),                -- SBO Object Type
    IN transaction_type NCHAR(1),               -- [A]dd, [U]pdate, [D]elete, [C]ancel, C[L]ose
    IN num_of_cols_in_key INT,
    IN list_of_key_cols_tab_del NVARCHAR(255),
    IN list_of_cols_val_tab_del NVARCHAR(255),  -- Valor de clave (DocEntry)
    OUT error INT,                              -- Result (0 for no error)
    OUT error_message NVARCHAR(200)             -- Error string to be displayed
)
LANGUAGE SQLSCRIPT
AS
BEGIN

    DECLARE Query NVARCHAR(4000);
	DECLARE ExcludeUsersName NVARCHAR(1000);
	DECLARE ExecTrack INT;
	DECLARE UserFilter INT;
	DECLARE UpdateUserColum NVARCHAR(100);
	DECLARE CreateUserColum NVARCHAR(100);
	DECLARE MasterTable NVARCHAR(10);
	DECLARE MasterTableKeyColumn NVARCHAR(100);
	DECLARE EntityName NVARCHAR(100);
	DECLARE CurrUserValid INT;
    DECLARE ActionType NVARCHAR(1);
    
    BEGIN
   	
		DECLARE EXIT HANDLER FOR 
			SQL_ERROR_CODE 288 
		BEGIN
			
		END;
		
	    
	    CREATE TABLE "SEI_TRACKER_TEMP" (
		   	"UserCount" INT
		);
	
	END;
				
	ExecTrack = 0;	
	UserFilter = 0;
	EntityName = '';
	
	-- For IN condition -> Example -> WHERE ... NOT IN (''YYY'',''XXX'')

	ExcludeUsersName = '
		''sboservice'',
		''ANOTHER_INVALID_USER'' 
	';

	IF object_type = '62' THEN 
		ExecTrack = 1; 
		UserFilter = 0;
		MasterTable = 'OOCR';
		MasterTableKeyColumn = 'OcrCode';
		EntityName = 'Distribution Rule';
	END IF;
	
	IF object_type = '61' THEN 
		ExecTrack = 1; 
		UserFilter = 0;
		MasterTable = 'OPRC';
		MasterTableKeyColumn = 'PrcCode';
		EntityName = 'Cost Center';
	END IF;

	ActionType = transaction_type;
	
	IF COALESCE(UserFilter, 0) <> 0 AND (COALESCE(UpdateUserColum, '') <> '' OR COALESCE(CreateUserColum, '') <> '') THEN
	
	    Query := 
	    '
	    	DO BEGIN
		    	
				DECLARE ExcludeUsersTable TABLE(
			    	ID INT,
			    	CODE NVARCHAR(255),
			   		NAME NVARCHAR(255)
			    );
			
			    ExcludeUsersTable =
			    SELECT
			    	"USERID" as "ID",
			    	"USER_CODE" as "CODE",
			    	"U_NAME" as "NAME"
			    FROM "' || tenant_db || '".OUSR WHERE USER_CODE IN (' || ExcludeUsersName || ');
		    
		    	INSERT INTO SEI_TRACKER_TEMP ("UserCount")
		       	SELECT 
		   			COUNT(*)
		   		FROM "' || tenant_db || '"."' || MasterTable || '"
		   		WHERE 
		   			1=1
		   			AND "' || tenant_db || '"."' || MasterTableKeyColumn || '" = ''' || list_of_cols_val_tab_del || '''
		   			AND CASE
		   				WHEN ''' || ActionType || ''' = ''C'' THEN "' || tenant_db || '"."' || CreateUserColum || '"
		   				ELSE "' || tenant_db || '"."' || UpdateUserColum || '"
		   			END 
		   			NOT IN 
		   			(
			   			SELECT "ID" FROM :ExcludeUsersTable
			   		);
			END;
	    ';
	    
	    EXEC(QUERY);
	    
	    SELECT 
	    	"UserCount" 
	    INTO CurrUserValid
	    FROM SEI_TRACKER_TEMP
    	LIMIT 1;
 	   	
		IF COALESCE(CurrUserValid, 0) = 0 THEN
   			ExecTrack = 0;
   		END IF;
		
    END IF;
	    
	    
	IF ExecTrack <> 0 THEN
	  
	    Query := 
	    '
	        MERGE INTO "@SEI_TRACKER" T1 USING (
	        	SELECT 
	        		''' || tenant_code || ''' as "TenantCode", 
	        		''' || list_of_cols_val_tab_del  || ''' as "ObjId",
	        		''' || ActionType || ''' as "Action",
	        		''' || object_type || ''' as "ObjType"
		         FROM DUMMY
	      	) T2
			ON (
				T1."U_SEI_TenantCode" = T2."TenantCode"
				AND T1."U_SEI_Status" = ''P'' 
				AND T1."U_SEI_ObjType" = T2."ObjType"
				AND T1."U_SEI_ObjId" = T2."ObjId"
			)
			WHEN MATCHED
		 	THEN 
			    UPDATE SET 
			    	T1."U_SEI_Action" = T2."Action"
			    	, T1."U_SEI_LastTrack" = TO_VARCHAR(CURRENT_TIMESTAMP, ''YYYY-MM-DD'') || ''T'' || TO_VARCHAR(CURRENT_TIMESTAMP, ''HH24:MI:SS'') || ''Z''
			WHEN NOT MATCHED
			THEN 
			    INSERT (
			    	"Code"
			    	, "Name"
			    	, "U_SEI_TenantCode"
			    	, "U_SEI_ObjType"
			    	, "U_SEI_ObjId"
			    	, "U_SEI_ObjName"
			    	, "U_SEI_Action"
			    	, "U_SEI_Status"
			    	, "U_SEI_LastTrack"
				) 
			    VALUES(
		    		TO_VARCHAR((SECONDS_BETWEEN(TO_TIMESTAMP(''1970-01-01 00:00:00''), CURRENT_TIMESTAMP) * 1000) + CAST(SECOND(CURRENT_TIMESTAMP) * 1000 AS BIGINT)) || ''-'' ||  SYSUUID
			    	, TO_VARCHAR((SECONDS_BETWEEN(TO_TIMESTAMP(''1970-01-01 00:00:00''), CURRENT_TIMESTAMP) * 1000) + CAST(SECOND(CURRENT_TIMESTAMP) * 1000 AS BIGINT)) || ''-'' || SYSUUID
			    	, T2."TenantCode"
			    	, T2."ObjType"
			    	, T2."ObjId"
			    	, ''' || EntityName || '''
			    	, T2."Action"
			    	, ''P''
			    	, TO_VARCHAR(CURRENT_TIMESTAMP, ''YYYY-MM-DD'') || ''T'' || TO_VARCHAR(CURRENT_TIMESTAMP, ''HH24:MI:SS'') || ''Z''
			    );
	    ';
	    
	    EXEC(Query);
	
	END IF;
	
	DROP TABLE SEI_TRACKER_TEMP;
END;