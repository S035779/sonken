import App from 'Pages/App/App';
import Dashboard from 'Pages/Dashboard/Dashboard';
import MarchantEdit from 'Pages/MarchantEdit/MarchantEdit';
import SellersEdit from 'Pages/NoteEdit/NoteEdit';
import Marchant from 'Pages/Note/Note'
import Bids from 'Pages/Starred/Starred';
import Trade from 'Pages/Starred/Starred';

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
          path: '/marchant/:id/edit',
          component: Dashboard,
          routes: [
            {
              component: MarchantEdit
            }
          ]
        },
        {
          path: '/sellers/:id/edit',
          component: Dashboard,
          routes: [
            {
              component: SellersEdit
            }
          ]
        },
        {
          path: '/marchant/:id',
          component: Marchant
        },
        {
          path: '/bids',
          component: Bids
        },
        {
          path: '/trade',
          component: Trade
        }
      ]
    }
  ];
};
