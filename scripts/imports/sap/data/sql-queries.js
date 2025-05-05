export const _Data_SQLQueries = [
    {
        SqlCode: 'CompanyAddress',
        SqlName: 'Get Company Address',
        SqlText: 'SELECT Street, StreetNo, Block, Building, City, ZipCode, County, Country, State FROM ADM1',
    },
    {
        SqlCode: 'GetReceiptsByCoupaID',
        SqlName: 'Get Receipts by Coupa ID',
        SqlText: "SELECT T1.DocEntry as ReceiptEntry, TH1.DocNum as ReceiptNumber, T1.LineNum as ReceiptLine, T2.DocEntry as PurchaseOrderEntry, TH2.DocNum as PurchaseOrderNumber, T2.LineNum as PurchaseOrderLine, T1.U_SEI_CoupaNestedID, T1.OpenInvQty FROM PDN1 T1 INNER JOIN OPDN TH1 ON T1.DocEntry = TH1.DocEntry AND TH1.CANCELED = 'N' INNER JOIN POR1 T2 ON T2.DocEntry = T1.BaseEntry AND T2.LineNum = T1.BaseLine AND T2.ObjType = T1.BaseType INNER JOIN OPOR TH2 ON T2.DocEntry = TH2.DocEntry WHERE T1.U_SEI_CoupaNestedID LIKE :id OR T1.U_SEI_CoupaNestedID LIKE :idStart OR T1.U_SEI_CoupaNestedID LIKE :idMiddle OR T1.U_SEI_CoupaNestedID LIKE :idEnd",
    },
    {
        SqlCode: 'GetReceiptsByCoupaPOLineID',
        SqlName: 'Get open receipt lines by coupa purchase order line ID',
        SqlText: "SELECT T2.DocEntry AS ReceiptEntry, T2.DocNum AS ReceiptNumber, T1.LineNum AS ReceiptLine, T1.U_SEI_CoupaNestedID AS ReceiptCoupaID, T4.DocEntry AS BasePOEntry, T4.DocNum AS BasePONumber, T4.U_SEI_CoupaID AS BasePOCoupaID, T3.LineNum AS BasePOLine, T3.U_SEI_CoupaID AS BasePOLineCoupaID, T1.OpenInvQty AS OpenReceiptQty, T5.ItemCode, T5.ItemType FROM PDN1 T1 INNER JOIN OPDN T2 ON T1.DocEntry = T2.DocEntry INNER JOIN POR1 T3 ON T1.BaseEntry = T3.DocEntry AND T1.BaseLine = T3.LineNum AND T1.BaseType = T3.ObjType INNER JOIN OPOR T4 ON T3.DocEntry = T4.DocEntry LEFT JOIN OITM T5 ON T1.ItemCode = T5.ItemCode WHERE T3.U_SEI_CoupaID = :id AND T2.CANCELED = 'N' AND T4.CANCELED = 'N' AND T1.OpenInvQty > 0",
    },
];
