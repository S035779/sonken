import App          from 'Pages/App/App';
import Dashboard    from 'Pages/Dashboard/Dashboard';
import MarchantEdit from 'Pages/MarchantEdit/MarchantEdit';
import SellersEdit  from 'Pages/SellersEdit/SellersEdit';
import ClosedEdit   from 'Pages/ClosedEdit/ClosedEdit';
import Bids         from 'Pages/Bids/Bids';
import Trade        from 'Pages/Trade/Trade';
import Auth         from 'Pages/Auth/Auth';
import Login        from 'Pages/Login/Login';
import LoginAuth    from 'Pages/LoginAuth/LoginAuth';
import LoginMgmt    from 'Pages/LoginMgmt/LoginMgmt';
import LoginRegist  from 'Pages/LoginRegist/LoginRegist';
import LoginConfirm from 'Pages/LoginConfirm/LoginConfirm';
import Admin        from 'Pages/Admin/Admin';
import Management   from 'Pages/Management/Management';
import UserEdit     from 'Pages/UserEdit/UserEdit';
import ApprovalEdit from 'Pages/ApprovalEdit/ApprovalEdit';
import Faq          from 'Pages/Faq/Faq';
import FaqEdit      from 'Pages/FaqEdit/FaqEdit';
import Mail         from 'Pages/Mail/Mail';
import MailEdit     from 'Pages/MailEdit/MailEdit';
import Faqs         from 'Pages/Faqs/Faqs';
import FaqsList     from 'Pages/FaqsList/FaqsList';
import Inquiry      from 'Pages/Inquiry/Inquiry';
import InquiryEdit  from 'Pages/InquiryEdit/InquiryEdit';

const getUserData = options => {
  return new Promise(resolve => {
    resolve(options);
  });
};

export default function getRoutes() {
  return [{ 
      path: '/'
    , exact: true
    , component: App
    , routes: [{ component: Dashboard, loadData: getUserData }] 
    }, {
      path: '/faqs'
    , component: Faqs
    , loadData: getUserData
    , routes: [{ component: FaqsList }]
    }, {
      path: '/inquiry'
    , component: Inquiry
    , loadData: getUserData
    , routes: [{ component: InquiryEdit }]
    }, {
      path: '/login/:page'
    , component: Auth
    , routes: [{
        component: Login
      , loadData: getUserData
      , routes: [
          { path: '/login/authenticate',  component: LoginAuth    }
        , { path: '/login/management',    component: LoginMgmt    }
        , { path: '/login/registration',  component: LoginRegist  }
        , { path: '/login/confirmation',  component: LoginConfirm }
        ] 
      }]
    }, {
      path: '/admin/:category'
    , component: Admin
    , routes: [{
        path: '/admin/faq/:id'
      , component: Faq
      , loadData: getUserData
      , routes: [{ path: '/admin/faq/:id/edit',  component: FaqEdit }]
      }, {
        path: '/admin/mail/:id'
      , component: Mail
      , loadData: getUserData
      , routes: [{ path: '/admin/mail/:id/edit', component: MailEdit }]
      }, {
        path: '/admin/:category/:id'
      , component: Management
      , loadData: getUserData
      , routes: [ 
          { path: '/admin/users/:id/edit',    component: UserEdit     }
        , { path: '/admin/approval/:id/edit', component: ApprovalEdit } 
        ]
      }, { 
        path: '/admin/faq'
      , component: Faq
      , loadData: getUserData
      }, {
        path: '/admin/mail'
      , component: Mail
      , loadData: getUserData
      }, { 
        path: '/admin/:category'
      , component: Management
      , loadData: getUserData
      }]
    }, {
      component: App
    , routes: [{ 
        path: '/:category/:id'
      , component: Dashboard
      , loadData: getUserData
      , routes: [
        { path: '/marchant/:id/edit',       component: MarchantEdit       }
      , { path: '/sellers/:id/edit',        component: SellersEdit        }
      , { path: '/closedmarchant/:id/edit', component: ClosedEdit         }
      , { path: '/closedsellers/:id/edit',  component: ClosedEdit         }
        ]
      }, {
        path: '/bids'
      , component: Bids
      , loadData: getUserData
      }, {
        path: '/trade'
      , component: Trade
      , loadData: getUserData
      }, {
        path: '/:category'
      , component: Dashboard
      , loadData: getUserData
      }] 
    }];
}
