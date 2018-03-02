import App from 'Pages/App/App';
import Dashboard from 'Pages/Dashboard/Dashboard';
import MarchantEdit from 'Pages/MarchantEdit/MarchantEdit';
import SellersEdit from 'Pages/SellersEdit/SellersEdit';
import Bids from 'Pages/Bids/Bids';
import Trade from 'Pages/Trade/Trade';

const getUserData = (user, match) => {
  return new Promise((resolve, reject) => {
    resolve(user);
  });
};

export default function getRoutes() {
  return [
    { component: App,
      routes: [
        {
          path: '/',
          exact: true,
          component: Dashboard,
          loadData: getUserData
        },
        {
          path: '/bids',
          component: Bids,
          loadData: getUserData
        },
        {
          path: '/trade',
          component: Trade,
          loadData: getUserData
        },
        {
          path: '/:category/:id',
          component: Dashboard,
          loadData: getUserData,
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
          component: Dashboard,
          loadData: getUserData
        }
      ]
    }
  ];
};
