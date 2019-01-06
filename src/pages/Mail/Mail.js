import loadable       from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types';
import { Redirect }             from 'react-router-dom';
import { renderRoutes }         from 'react-router-config';
import { Container }            from 'flux/utils';
import MailAction               from 'Actions/MailAction';
import { getStores, getState }  from 'Stores';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
const MailSearch  = loadable(() => import('Components/MailSearch/MailSearch'));
const MailButtons = loadable(() => import('Components/MailButtons/MailButtons'));
const MailList    = loadable(() => import('Components/MailList/MailList'));

class Mail extends React.Component {
  static getStores() {
    return getStores(['mailStore']);
  }

  static calculateState() {
    return getState('mailStore');
  }

  static prefetch({ admin }) {
    if(!admin) return null;
    std.logInfo(Mail.displayName, 'fetch', { admin });
    return MailAction.presetAdmin(admin)
      .then(() => MailAction.fetchMails(admin));
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
    const { isAuthenticated, admin } = this.state;
    if(isAuthenticated) {
      this.spn.start();
      //std.logInfo(Mail.displayName, 'fetch', 'Mail');
      //MailAction.fetchMails(admin)
      Mail.prefetch({ admin })
        .then(() => this.spn.stop());
    }
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  mailPage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    //std.logInfo(Mail.displayName, 'State', this.state);
    //std.logInfo(Mail.displayName, 'Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, admin, mails, page, ids } = this.state;
    const _id = match.params.id;
    const mail = mails.find(obj => obj._id === _id);
    const number = mails.length;
    mails.length = this.mailPage(number, page);
    return isAuthenticated 
      ? ( <div className={classes.root}>
          <MailSearch admin={admin} mailNumber={number} mailPage={page} />
          <div className={classes.body}>
            <div className={classes.mailList}>
              <MailButtons admin={admin} mails={mails} selectedMailId={ids} />
              <MailList admin={admin} mails={mails} selectedMailId={ids} mailPage={page}/>
            </div>
            <div className={classes.mailEdit}>{route.routes ? renderRoutes(route.routes,{ admin, mail }) : null}</div>
          </div>
        </div> )
      : ( <Redirect to={{ pathname: '/login/authenticate', state: { from: location } }} /> );
  }
}
Mail.displayName = 'Mail';
Mail.defaultProps = {};
Mail.propTypes = {
  classes: PropTypes.object.isRequired
, match: PropTypes.object.isRequired
, route: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};
const barHeightSmUp     = 112;
const barHeightSmDown   = 104;
const listWidth         = 400;
const searchHeight      = 62;
const mailHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)`;
const mailHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, mailList: { width: listWidth, minWidth: listWidth, height: mailHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: mailHeightSmUp }}
, mailEdit: { flex: 1 }
});
export default withStyles(styles)(Container.create(Mail));
