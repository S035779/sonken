import App from 'Pages/App/App';
import Dashboard from 'Pages/Dashboard/Dashboard';
import MarchantEdit from 'Pages/MarchantEdit/MarchantEdit';
import SellersEdit from 'Pages/SellersEdit/SellersEdit';
import Bids from 'Pages/Bids/Bids';
import Trade from 'Pages/Trade/Trade';

export default function getRoutes() {
  return [
    { component: App,
      routes: [
        {
          path: '/',
          exact: true,
          component: Dashboard
        },
        {
          path: '/bids',
          component: Bids
        },
        {
          path: '/trade',
          component: Trade
        },
        {
          path: '/:category/:id',
          component: Dashboard,
          routes: [
            {
              path: '/marchant/:id/edit',
              component: MarchantEdit
            },
            {
              path: '/sellers/:id/edit',
              component: SellersEdit
            }
          ]
        },
        {
          path: '/:category',
          component: Dashboard
        }
      ]
    }
  ];
};
