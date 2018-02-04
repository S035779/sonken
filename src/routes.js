import App from 'Pages/App/App';
import Dashboard from 'Pages/Dashboard/Dashboard';
import NoteEdit from 'Pages/NoteEdit/NoteEdit';
import Note from 'Pages/Note/Note'
import Starred from 'Pages/Starred/Starred';

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
          path: '/notes/:id/edit',
          component: Dashboard,
          routes: [
            {
              component: NoteEdit
            }
          ]
        },
        {
          path: '/notes/:id',
          component: Note
        },
        {
          path: '/starred',
          component: Starred
        }
      ]
    }
  ];
};
