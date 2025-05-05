--------------------------------------------------------------------------------------------------------------------------------

--Author : Jiafu Chen
--Upadte Date : 27/01/2025
--Description : Traking objects table for integration services

IF object_type IN ('61','62') THEN

	DECLARE RUN_TRACKER INT;
	DECLARE SEI_COSTCENTER_DIMCODE INT;
	
	RUN_TRACKER = 1;
	
	IF object_type = '61' THEN
		SELECT 
			"DimCode"
		INTO SEI_COSTCENTER_DIMCODE
		FROM OPRC
		WHERE "PrcCode" = list_of_cols_val_tab_del;
	END IF;
	
	IF object_type = '62' THEN
		SELECT 
			"DimCode"
		INTO SEI_COSTCENTER_DIMCODE
		FROM OOCR
		WHERE "OcrCode" = list_of_cols_val_tab_del;
	END IF;
	
	
	IF SEI_COSTCENTER_DIMCODE <> 1 THEN
		RUN_TRACKER = 0;
	END IF;

	IF RUN_TRACKER = 1 THEN
		CALL "KURITA_ICS_MASTERDATADISTRIBUTION".SEI_TRACKING(
			'KXX', -- Change to the correct tenant code
			'KURITA_XXXX', -- Change to the correct entity name
			object_type,			-- SBO Object Type
			transaction_type,		-- [A]dd, [U]pdate, [D]elete, [C]ancel, C[L]ose
			num_of_cols_in_key,
			list_of_key_cols_tab_del,
			list_of_cols_val_tab_del,
			error,
			error_message
		);
	END IF;
	
END IF;

--------------------------------------------------------------------------------------------------------------------------------