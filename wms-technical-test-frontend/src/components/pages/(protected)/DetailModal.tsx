/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, RefObject, useEffect, useState } from 'react';

import Modal from '@/components/modals/Modal';
import { Order } from '@/types/order';
import Button from '@/components/commons/Button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  getOrder,
  getOrderReset,
  postOrderPack,
  postOrderPackReset,
  postOrderPick,
  postOrderPickReset,
  postOrderShip,
  postOrderShipReset,
} from '@/redux/slices/order';
import { valueFormatNumber } from '@/helpers/number';
import { toastError, toastSuccess } from '@/helpers/reactToastify';
import PermissionCanAccess from '@/components/PermissionCanAccess';
import Select from '@/components/commons/Select';
import { getLogisticChannelDropdown } from '@/redux/slices/logisticChannel';
import { Select as TSelect } from '@/types/select';
import { dateStringToStringFormat3 } from '@/helpers/date';

type DetailModalProps = {
  order?: Order | null;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onClosed: () => void;
  tableRef: RefObject<{ refresh: () => void } | null>;
};

const DetailModal: FC<DetailModalProps> = ({
  order: initialOrder,
  isOpen,
  setIsOpen,
  onClosed,
  tableRef,
}) => {
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<Order | null | undefined>(initialOrder);
  const [logisticChannel, setLogisticChannel] =
    useState<TSelect<string> | null>(null);
  const getOrderData = useAppSelector((state) => state.order.getOrderData);
  const getOrderErrorMessage = useAppSelector(
    (state) => state.order.getOrderErrorMessage
  );
  const getOrderLoading = useAppSelector(
    (state) => state.order.getOrderLoading
  );
  const postOrderPickData = useAppSelector(
    (state) => state.order.postOrderPickData
  );
  const postOrderPickErrorMessage = useAppSelector(
    (state) => state.order.postOrderPickErrorMessage
  );
  const postOrderPickLoading = useAppSelector(
    (state) => state.order.postOrderPickLoading
  );
  const postOrderPackData = useAppSelector(
    (state) => state.order.postOrderPackData
  );
  const postOrderPackErrorMessage = useAppSelector(
    (state) => state.order.postOrderPackErrorMessage
  );
  const postOrderPackLoading = useAppSelector(
    (state) => state.order.postOrderPackLoading
  );
  const postOrderShipData = useAppSelector(
    (state) => state.order.postOrderShipData
  );
  const postOrderShipErrorMessage = useAppSelector(
    (state) => state.order.postOrderShipErrorMessage
  );
  const postOrderShipLoading = useAppSelector(
    (state) => state.order.postOrderShipLoading
  );
  const getLogisticChannelDropdownData = useAppSelector(
    (state) => state.logisticChannel.getLogisticChannelDropdownData
  );

  const onClosedHandler = () => {
    onClosed();
  };

  const pickHandler = () => {
    if (order?.order_sn) dispatch(postOrderPick(order?.order_sn));
  };

  const packHandler = () => {
    if (order?.order_sn) dispatch(postOrderPack(order?.order_sn));
  };

  const shipHandler = () => {
    if (order?.order_sn && logisticChannel && logisticChannel.value != '') {
      dispatch(
        postOrderShip({
          orderSN: order.order_sn,
          data: {
            channel_id: logisticChannel?.value,
          },
        })
      );
    }
  };

  const logisticChannelOnChange = (value: TSelect<string> | null) => {
    setLogisticChannel(value);
  };

  useEffect(() => {
    if (isOpen && initialOrder?.order_sn) {
      if (initialOrder?.wms_status === 'PACKED') {
        dispatch(getLogisticChannelDropdown());
      }

      dispatch(getOrder(initialOrder?.order_sn));
    } else if (!isOpen && !initialOrder?.order_sn) {
      setOrder(null);
    }

    return () => {};
  }, [isOpen, initialOrder?.order_sn, initialOrder?.wms_status, dispatch]);

  useEffect(() => {
    if (!getOrderLoading) {
      if (getOrderData) {
        setOrder(getOrderData?.data);
      } else if (getOrderErrorMessage) {
        //
      }

      if (getOrderData || getOrderErrorMessage) {
        dispatch(getOrderReset());
      }
    }
  }, [
    getOrderData,
    getOrderErrorMessage,
    getOrderLoading,
    setIsOpen,
    dispatch,
  ]);

  useEffect(() => {
    if (!postOrderPickLoading) {
      if (postOrderPickData) {
        toastSuccess('Success', postOrderPickData.message);
      } else if (postOrderPickErrorMessage) {
        toastError('Error', postOrderPickErrorMessage);
      }

      if (postOrderPickData || postOrderPickErrorMessage) {
        dispatch(postOrderPickReset());
      }
    }
  }, [
    postOrderPickData,
    postOrderPickErrorMessage,
    postOrderPickLoading,
    setIsOpen,
    dispatch,
  ]);

  useEffect(() => {
    if (!postOrderPackLoading) {
      if (postOrderPackData) {
        toastSuccess('Success', postOrderPackData.message);
        setIsOpen(false);
        tableRef.current?.refresh();
      } else if (postOrderPackErrorMessage) {
        toastError('Error', postOrderPackErrorMessage);
      }

      if (postOrderPackData || postOrderPackErrorMessage) {
        dispatch(postOrderPackReset());
      }
    }
  }, [
    postOrderPackData,
    postOrderPackErrorMessage,
    postOrderPackLoading,
    setIsOpen,
    dispatch,
    tableRef,
  ]);

  useEffect(() => {
    if (!postOrderPickLoading) {
      if (postOrderPickData) {
        toastSuccess('Success', postOrderPickData.message);
        setIsOpen(false);
        tableRef.current?.refresh();
      } else if (postOrderPickErrorMessage) {
        toastError('Error', postOrderPickErrorMessage);
      }

      if (postOrderPickData || postOrderPickErrorMessage) {
        dispatch(postOrderPickReset());
      }
    }
  }, [
    postOrderPickData,
    postOrderPickErrorMessage,
    postOrderPickLoading,
    setIsOpen,
    dispatch,
    tableRef,
  ]);

  useEffect(() => {
    if (!postOrderShipLoading) {
      if (postOrderShipData) {
        toastSuccess('Success', postOrderShipData.message);
        setIsOpen(false);
        tableRef.current?.refresh();
      } else if (postOrderShipErrorMessage) {
        toastError('Error', postOrderShipErrorMessage);
      }

      if (postOrderShipData || postOrderShipErrorMessage) {
        dispatch(postOrderShipReset());
      }
    }
  }, [
    postOrderShipData,
    postOrderShipErrorMessage,
    postOrderShipLoading,
    setIsOpen,
    dispatch,
    tableRef,
  ]);

  const items = order?.items ?? [];
  const logisticChannels = getLogisticChannelDropdownData?.data ?? [];
  const logisticChannelsOptions = logisticChannels.map((logisticChannel) => {
    return {
      label: logisticChannel.name ?? '',
      value: logisticChannel.id,
    };
  }) as TSelect<string>[];

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClosed={onClosedHandler}
      dialogPanelClassName='max-w-2xl'
    >
      <div className='mb-8'>
        <span className='text-[24px] font-bold'>Detail</span>
      </div>
      <div className='mb-6 grid grid-cols-12 gap-5 text-[14px]'>
        <div className='col-span-12'>
          {getOrderLoading && (
            <div className='w-full text-center'>
              <span className='font-medium'>Loading</span>
            </div>
          )}
          {!getOrderLoading && (
            <>
              <div className='grid grid-cols-12 gap-4'>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Order SN</span>
                  <span>{order?.order_sn ?? '-'}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Shop ID</span>
                  <span>{order?.shop_id ?? '-'}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Marketplace Status</span>
                  <span>{order?.marketplace_status ?? '-'}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Shipping Status</span>
                  <span>{order?.shipping_status ?? '-'}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>WMS Status</span>
                  <span>{order?.wms_status ?? '-'}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Tracking Number</span>
                  <span>{order?.tracking_number ?? '-'}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Total Amount</span>
                  <span>{valueFormatNumber(order?.total_amount ?? '-')}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Raw Marketplace Payload</span>
                  <span>{order?.raw_marketplace_payload ?? '-'}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Created At</span>
                  <span>{order?.updated_at ? dateStringToStringFormat3(order.created_at) : '-'}</span>
                </div>
                <div className='col-span-12 flex flex-col sm:col-span-6'>
                  <span className='font-medium'>Updated At</span>
                  <span>{order?.updated_at ? dateStringToStringFormat3(order.updated_at) : '-'}</span>
                </div>
                <div className='col-span-12'>
                  <table className='min-w-full border-separate border-spacing-0 overflow-x-auto bg-white'>
                    <thead>
                      <tr>
                        <th className='ticky top-0 z-2 border-b bg-[#F9F9F9] px-5 py-4 text-left text-[14px] font-bold text-nowrap text-gray-700'>
                          SKU
                        </th>
                        <th className='ticky top-0 z-2 border-b bg-[#F9F9F9] px-5 py-4 text-left text-[14px] font-bold text-nowrap text-gray-700'>
                          Quantity
                        </th>
                        <th className='ticky top-0 z-2 border-b bg-[#F9F9F9] px-5 py-4 text-left text-[14px] font-bold text-nowrap text-gray-700'>
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const key = `${item.order_sn}-${item.sku}`;

                        return (
                          <tr
                            key={key}
                            className='text-[14px] hover:bg-gray-50'
                          >
                            <td className='h-15.5 min-h-15.5 px-5 py-1.5 text-nowrap text-gray-700'>
                              {item.sku}
                            </td>
                            <td className='h-15.5 min-h-15.5 px-5 py-1.5 text-nowrap text-gray-700'>
                              {valueFormatNumber(item.quantity)}
                            </td>
                            <td className='h-15.5 min-h-15.5 px-5 py-1.5 text-nowrap text-gray-700'>
                              {item.price}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='flex flex-row gap-2'>
                {order?.wms_status === 'READY_TO_PICK' && (
                  <>
                    <PermissionCanAccess roleAccessKeys={['orders.pick']}>
                      <Button
                        className='mt-6'
                        color='white'
                        isOutline
                        onClick={() => pickHandler()}
                        isLoading={postOrderPickLoading}
                      >
                        Pick
                      </Button>
                    </PermissionCanAccess>
                  </>
                )}
                {order?.wms_status === 'PICKING' && (
                  <>
                    <PermissionCanAccess roleAccessKeys={['orders.pack']}>
                      <Button
                        className='mt-6'
                        color='white'
                        isOutline
                        onClick={() => packHandler()}
                        isLoading={postOrderPackLoading}
                      >
                        Pack
                      </Button>
                    </PermissionCanAccess>
                  </>
                )}
                {order?.wms_status === 'PACKED' && (
                  <>
                    <PermissionCanAccess roleAccessKeys={['orders.ship']}>
                      <div className='mt-6'>
                        <div className='w-[250px]'>
                          <Select<any, string>
                            label='Logistic Channel'
                            placeholder=''
                            selected={logisticChannel}
                            options={logisticChannelsOptions}
                            onChange={logisticChannelOnChange}
                          />
                        </div>
                        <Button
                          className='mt-2'
                          color='white'
                          isOutline
                          onClick={() => shipHandler()}
                          isLoading={postOrderShipLoading}
                        >
                          Ship
                        </Button>
                      </div>
                    </PermissionCanAccess>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DetailModal;
