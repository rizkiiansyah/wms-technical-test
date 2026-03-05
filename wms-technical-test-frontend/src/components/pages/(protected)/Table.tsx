/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FC, memo, RefObject, useCallback, useMemo, useState } from 'react';

import ServerTable, {
  FetchDataParams,
  ServerResponse,
} from '@/components/tables/ServerTable';
import Button from '@/components/commons/Button';
import { GetOrdersParams, Order } from '@/types/order';
// import { dateStringToStringFormat3 } from '@/helpers/date';
import { getOrders } from '@/services/order';
import PermissionCanAccess from '@/components/PermissionCanAccess';
import { dateStringToStringFormat3 } from '@/helpers/date';
import Select from '@/components/commons/Select';
import { Select as TSelect } from '@/types/select';

const fetchOrders = async ({
  page,
  pageSize,
  ...otherParams
}: {
  page?: number;
  pageSize?: number;
  wmsStatus?: string | null;
}): Promise<ServerResponse<Order>> => {
  const params: GetOrdersParams = {
    page,
    per_page: pageSize,
    ...otherParams,
  };
  const data = await getOrders(params);

  return {
    items: data.data ?? [],
    totalCount: data.meta?.total ?? 0,
  };
};

const resolveResponse = (
  response: ServerResponse<Order>
): ServerResponse<Order> => {
  return { items: response.items ?? [], totalCount: response.totalCount };
};

type TableProps = {
  ref: RefObject<{
    refresh: () => void;
    call: (params: FetchDataParams) => void;
  } | null>;
  setDetailModal: (params: { order: Order; isOpen: boolean }) => void;
};

const Table: FC<TableProps> = ({ ref, setDetailModal }) => {
  const filters = useMemo(
    () => [
      { label: 'READY_TO_PICK', value: 'READY_TO_PICK' },
      { label: 'PICKING', value: 'PICKING' },
      { label: 'PACKED', value: 'PACKED' },
      { label: 'SHIPPED', value: 'SHIPPED' },
    ],
    []
  );
  const [filter, setFilter] = useState<TSelect<any, string> | null>(null);

  const setDetailModalHandler = useCallback(
    (order: Order) => {
      setDetailModal({
        order: order,
        isOpen: true,
      });
    },
    [setDetailModal]
  );

  const filterOnChange = (value: TSelect<string, any> | null) => {
    ref.current?.call({
      wms_status: value?.value,
    });
    setFilter(value);
  };

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      { accessorKey: 'order_sn', header: 'Order SN', enableSorting: false },
      {
        accessorKey: 'marketplace_status',
        header: 'Marketplace Status',
        enableSorting: false,
      },
      {
        accessorKey: 'shipping_status',
        header: 'Shipping Status',
        enableSorting: false,
      },
      { accessorKey: 'wms_status', header: 'WMS Status', enableSorting: false },
      {
        accessorKey: 'tracking_number',
        header: 'Tracking Number',
        enableSorting: false,
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        enableSorting: true,
        cell: (props) => {
          const data = props.row.original;

          return dateStringToStringFormat3(data.updated_at);
        },
      },
      {
        header: 'Actions',
        enableSorting: false,
        cell: (props) => {
          const data = props.row.original;

          return (
            <div className='flex flex-row gap-2'>
              <PermissionCanAccess roleAccessKeys={['orders.detail']}>
                <Button
                  color='white'
                  isOutline
                  onClick={() => setDetailModalHandler(data)}
                >
                  Detail
                </Button>
              </PermissionCanAccess>
            </div>
          );
        },
      },
    ],
    [setDetailModalHandler]
  );

  return (
    <ServerTable<Order, ServerResponse<Order>>
      ref={ref}
      columns={columns}
      fetchData={fetchOrders}
      resolveResponse={resolveResponse}
      initialSorting={[{ id: 'updated_at', desc: true }]}
      CustomFilter={
        <Select<any, string>
          placeholder='Select WMS Status'
          selected={filter}
          options={filters}
          showUnselectValue={true}
          onChange={filterOnChange}
          containerClassName='w-full sm:min-w-[200px] md:min-w-[250px]'
        />
      }
    />
  );
};

export default memo(Table);
