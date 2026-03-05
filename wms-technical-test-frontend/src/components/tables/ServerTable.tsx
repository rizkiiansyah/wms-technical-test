/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  forwardRef,
  JSX,
  memo,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import { FaSyncAlt } from 'react-icons/fa';

import Select from '../commons/Select';
import { usePagination, DOTS, getTotalPages } from '@/hooks/usePagination';
import { Select as TSelect } from '@/types/select';
import Button from '../commons/Button';
import { getErrorMessage } from '@/helpers/api';
import { cn } from '@/utils/cn';

import '@/styles/scss/server-table.scss';

export type ServerResponse<T> = {
  items: T[];
  totalPages?: number | null;
  totalCount?: number | null;
};

export type FetchDataParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc' | null;
  search?: string | null;
  keySearch?: string | null;
  [custom: string]: string | number | null | undefined;
};

type ServerTableProps<T extends object, TResponse> = {
  columns: ColumnDef<T, any>[];
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (value: PaginationState) => void;
  fetchData?: (params: FetchDataParams) => Promise<TResponse> | null;
  resolveResponse: (response: TResponse) => ServerResponse<T>;
  tableClassName?: string;
  tableWrapperClassName?: string;
  filters?: TSelect<string>[] | null;
  initialSorting?: { id: string; desc: boolean }[];
  CustomFilter?: ReactNode;
};

const ServerTableInner = <T extends object, TResponse>(
  {
    columns,
    onPaginationChange,
    fetchData,
    resolveResponse,
    tableClassName,
    tableWrapperClassName,
    filters,
    initialSorting = [],
    CustomFilter,
  }: ServerTableProps<T, TResponse>,
  ref: Ref<{ refresh: () => void; call: (params: FetchDataParams) => void }>
) => {
  const [data, setData] = useState<T[]>([]);
  const defaultPagination = useMemo(
    () => ({
      pageIndex: 0,
      pageSize: 10,
    }),
    []
  );
  const [pagination, setPagination] = useState(defaultPagination);
  const [totalPages, setTotalPages] = useState(0);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState<TSelect<number>>({
    label: '10',
    value: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const pageSizes: TSelect<number>[] = useMemo(
    () => [
      { label: '10', value: 10 },
      { label: '25', value: 25 },
      { label: '50', value: 50 },
      { label: '100', value: 100 },
    ],
    []
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otherParams, setOtherParams] = useState<FetchDataParams | null>(null);
  const searchRef = useRef('');
  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: { sorting, pagination },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updateOrValue) => {
      const nextState =
        typeof updateOrValue === 'function'
          ? updateOrValue(pagination)
          : updateOrValue;

      if (onPaginationChange) {
        onPaginationChange(nextState);
      }

      loadData({
        page: nextState.pageIndex,
        pageSize: nextState.pageSize,
        search: searchRef.current,
      });
    },
  });
  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    setPageIndex,
    nextPage,
    previousPage,
    getState,
  } = table;
  const pageOptions = usePagination({
    currentPage: pagination.pageIndex,
    totalPages: totalPages,
    siblingCount: 1,
    pageSize: pageSize.value,
  });
  const oldTotalCount = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    refresh: refreshHandler,
    call: callHandler,
  }));

  const loadData = useCallback(
    async ({
      page,
      pageSize,
      search,
      keySearch,
      ...custom
    }: {
      page: number;
      pageSize: number;
      search?: string | null;
      keySearch?: string | null;
    }) => {
      setIsLoading(true);
      setErrorMessage(null);

      if (!fetchData) return;

      try {
        const newPage = oldTotalCount.current >= pageSize ? page + 1 : 1;
        const sort = sorting[0];
        let order: 'asc' | 'desc' | null = null;
        order =
          typeof sort?.desc === 'boolean'
            ? sort?.desc
              ? 'desc'
              : 'asc'
            : null;
        const params: FetchDataParams = {
          page: newPage,
          pageSize: pageSize,
          sortBy: sort?.id,
          order: order,
          search: search,
          keySearch: keySearch,
          ...custom,
        };

        const res = await fetchData(params);
        const parsed = resolveResponse(res!);
        let newTotalCount = 0;
        let totalPages = 1;

        setData(parsed.items);

        if (parsed.totalCount) {
          totalPages = getTotalPages(parsed.totalCount, pageSize);
          newTotalCount = parsed.totalCount;

          setTotalPages(totalPages);
          setTotalCount(parsed.totalCount);
        }
        if (parsed.totalPages) {
          totalPages = parsed.totalPages;

          setTotalPages(parsed.totalPages);
        }

        setPagination({
          pageIndex: newTotalCount >= pageSize ? page : 0,
          pageSize: pageSize,
        });

        oldTotalCount.current = newTotalCount;
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
        setTotalPages(0);
        setData([]);
        setTotalCount(0);

        oldTotalCount.current = 0;
      } finally {
        const selectedPageSize = pageSizes.find(
          (element) => element.value === pageSize
        );

        if (selectedPageSize) {
          setPageSize(selectedPageSize);
        }

        setIsLoading(false);
      }
    },
    [sorting, fetchData, resolveResponse, pageSizes]
  );

  const pageSizeChangeHandler = (value: TSelect<number> | null) => {
    if (value) {
      loadData({
        page: pagination.pageIndex,
        pageSize: value.value,
        search: searchRef.current,
        keySearch: null,
      });
    }
  };

  const numberOnClickHandler = (item: number) => {
    if (item - 1 !== pagination.pageIndex) {
      setPageIndex(item - 1);
    }
  };

  const refreshHandler = () => {
    loadData({
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
      search: searchRef.current,
      keySearch: null,
      ...otherParams,
    });
  };

  const callHandler = (params: FetchDataParams) => {
    loadData({
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
      search: searchRef.current,
      ...params,
    });
    setOtherParams(params);
  };

  useEffect(() => {
    loadData({
      page: defaultPagination.pageIndex,
      pageSize: defaultPagination.pageSize,
      search: searchRef.current,
      keySearch: null,
    });
  }, [loadData, defaultPagination.pageIndex, defaultPagination.pageSize]);

  let showingFrom = pagination.pageIndex + 1;
  showingFrom =
    pagination.pageIndex > 0
      ? pagination.pageIndex * pageSize.value + 1
      : showingFrom;
  showingFrom = totalCount > 0 ? showingFrom : 0;
  let showingTo = (pagination.pageIndex + 1) * pageSize.value;
  showingTo = showingTo > totalCount ? totalCount : showingTo;

  return (
    <>
      <div
        className={cn(
          'mb-5 flex flex-col justify-between gap-4',
          filters ? 'xl:flex-row' : 'md:flex-row'
        )}
      >
        <div className='flex flex-row items-center gap-3 text-[14px]'>
          <span>Show</span>
          <Select<any, number>
            placeholder=''
            selected={pageSize}
            options={pageSizes}
            showUnselectValue={false}
            onChange={pageSizeChangeHandler}
          />
          <span>Row</span>
        </div>
        <div
          className={cn(
            'flex flex-col gap-3',
            filters ? 'lg:flex-row' : 'md:flex-row'
          )}
        >
          {CustomFilter}
          {/* {filters && (
            <Select<any, string>
              iconLeft={<TiFilter className='text-[22px]' />}
              placeholder='Select filter'
              selected={filter}
              options={filters}
              showUnselectValue={true}
              onChange={filterChangeHandler}
              containerClassName='w-full sm:min-w-[200px] md:min-w-[250px]'
            />
          )} */}
          <div className='flex flex-row gap-2'>
            <Button color='white' isOutline onClick={refreshHandler}>
              <FaSyncAlt className='text-[14px]' />
            </Button>
          </div>
        </div>
      </div>
      <div
        className={cn(
          'relative max-h-170 w-full overflow-x-auto rounded-lg border',
          tableWrapperClassName
        )}
      >
        {isLoading && (
          <div className='absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2'>
            <div className='flex flex-col items-center justify-center gap-2'>
              <div className='text-black'>Loading</div>
            </div>
          </div>
        )}
        <table
          className={cn(
            'server-table min-w-full border-separate border-spacing-0 overflow-x-auto bg-white',
            tableClassName
          )}
        >
          <thead>
            {getHeaderGroups().map((headerGroup) => {
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const orderType =
                      {
                        asc: 'asc',
                        desc: 'desc',
                      }[header.column.getIsSorted() as string] ?? null;

                    return (
                      <th
                        key={header.id}
                        className='sticky top-0 z-2 cursor-pointer border-b bg-[#F9F9F9] px-5 py-4 text-left text-[14px] font-bold text-nowrap text-gray-700 select-none'
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className='flex flex-row items-center'>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.columnDef.enableSorting && (
                            <div className='ms-auto ps-2'>
                              <FaChevronUp
                                className={cn(
                                  'text-[13px] text-gray-300',
                                  orderType === 'asc' ? 'text-black' : ''
                                )}
                              />
                              <FaChevronDown
                                className={cn(
                                  'text-[13px] text-gray-300',
                                  orderType === 'desc' ? 'text-black' : ''
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody>
            {errorMessage && (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-4 py-4 text-center text-[14px] text-red-500'
                >
                  {errorMessage}
                </td>
              </tr>
            )}
            {!errorMessage && (
              <>
                {getRowModel().rows.length < 1 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className='h-14 min-h-14 px-4 py-4 text-center text-[14px] text-nowrap text-gray-500'
                    >
                      {!isLoading ? 'No data found' : ''}
                    </td>
                  </tr>
                ) : (
                  getRowModel().rows.map((row) => (
                    <tr key={row.id} className='text-[14px] hover:bg-gray-50'>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className='h-15.5 min-h-15.5 px-5 py-1.5 text-nowrap text-gray-700'
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      <div className='mt-5 flex flex-col items-center justify-between gap-3 md:flex-row'>
        <span className='text-[14px]'>
          Showing {showingFrom}-{showingTo} of {totalCount} results
        </span>
        <div className='flex items-center'>
          <ul className='flex flex-row items-stretch'>
            <li>
              <Button
                // size="small"
                className={cn(
                  'h-full bg-white text-[15px]',
                  getCanPreviousPage()
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-400 hover:cursor-default hover:bg-white'
                )}
                onClick={getCanPreviousPage() ? previousPage : undefined}
              >
                <FaChevronLeft />
              </Button>
            </li>
            {pageOptions.map((item, key) => (
              <li key={key} className={cn('h-full')}>
                {item !== DOTS ? (
                  <Button
                    // size="small"
                    className={cn(
                      'text-black',
                      getState().pagination.pageIndex + 1 !== item
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-gray-100'
                    )}
                    onClick={() => numberOnClickHandler(item as number)}
                  >
                    {item}
                  </Button>
                ) : (
                  <Button
                    // size="small"
                    className='bg-white text-black hover:cursor-default hover:bg-white'
                  >
                    {item}
                  </Button>
                )}
              </li>
            ))}
            <li>
              <Button
                // size="small"
                className={cn(
                  'h-full bg-white text-[15px]',
                  getCanNextPage()
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-400 hover:cursor-default hover:bg-white'
                )}
                onClick={getCanNextPage() ? nextPage : undefined}
              >
                <FaChevronRight />
              </Button>
            </li>
          </ul>
        </div>
      </div>
      {/* <div className="mt-4 flex items-center justify-between">
        <button
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || loading}
        >
          Next
        </button>
      </div> */}
    </>
  );
};

export const ServerTable = memo(forwardRef(ServerTableInner)) as <
  T extends object,
  TResponse
>(
  props: ServerTableProps<T, TResponse> & {
    ref?: Ref<{ refresh: () => void }> | null;
  }
) => JSX.Element;

export default ServerTable;
