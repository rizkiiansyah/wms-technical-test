const routes = [
  {
    url: '/',
    title: 'Order List',
    permissionKey: 'orders.list'
  },
];

export default routes;

export const needRedirectUnprotectedRoute = ['/login'];