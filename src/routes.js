import App from 'Pages/App/App';
import Dashboard from 'Pages/Dashboard/Dashboard';
import MarchantEdit from 'Pages/MarchantEdit/MarchantEdit';
import SellersEdit from 'Pages/SellersEdit/SellersEdit';
import Bids from 'Pages/Bids/Bids';
import Trade from 'Pages/Trade/Trade';
import Login from 'Pages/Login/Login';
import Public from 'Pages/Public/Public';

const getUserData = (user, match) => {
  return new Promise((resolve, reject) => {
    resolve(user);
  });
};

export default function getRoutes() {
  return [
    {
      path: '/public',
      component: Public
    },
    {
      path: '/login',
      componrnt: Login
    },
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
