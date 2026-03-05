'use client';

import { useCallback, useRef, useState } from 'react';

import Table from './Table';
import { Order } from '@/types/order';
import DetailModal from './DetailModal';
import { FetchDataParams } from '@/components/tables/ServerTable';

const ClientWrapper = () => {
  const tableRef = useRef<{
    refresh: () => void;
    call: (params: FetchDataParams) => void;
  }>(null);
  const [detailModal, setDetailModal] = useState<{
    order?: Order | null;
    isOpen: boolean;
  }>({
    order: null,
    isOpen: false,
  });

  const setDetailModalHandler = useCallback(
    ({
      order = null,
      isOpen = false,
    }: {
      order?: Order | null;
      isOpen: boolean;
    }) => {
      setDetailModal((oldValue) => ({
        ...oldValue,
        order: order,
        isOpen: isOpen,
      }));
    },
    []
  );

  const detailModalOnClosedHandler = useCallback(() => {
    setDetailModal((oldValue) => ({
      ...oldValue,
      order: null,
    }));
  }, []);

  const setDetailModalIsOpenHandler = useCallback((value: boolean) => {
    setDetailModal((oldValue) => ({
      ...oldValue,
      isOpen: value,
    }));
  }, []);

  return (
    <>
      <Table ref={tableRef} setDetailModal={setDetailModalHandler} />
      <DetailModal
        order={detailModal.order}
        isOpen={detailModal.isOpen}
        setIsOpen={setDetailModalIsOpenHandler}
        onClosed={detailModalOnClosedHandler}
        tableRef={tableRef}
      />
    </>
  );
};

export default ClientWrapper;
