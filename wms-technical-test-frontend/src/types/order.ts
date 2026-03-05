export type Order = {
  order_sn?: string | null;
  shop_id?: string | null;
  marketplace_status?: string | null;
  shipping_status?: string | null;
  wms_status?: string | null;
  tracking_number?: string | null;
  total_amount?: number | null;
  raw_marketplace_payload?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items?: {
    order_sn?: string | null;
    sku?: string | null;
    quantity?: number | null;
    price?: number | null;
  }[] | null;
};

export type GetOrdersParams = {
  wms_status?: string | null;
  page?: number | null;
  per_page?: number | null;
};
