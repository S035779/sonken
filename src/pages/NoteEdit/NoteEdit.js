import React from 'react';
import PropTypes from 'prop-types';
import NoteAction from 'Actions/NoteAction';

import { withStyles } from 'material-ui/styles';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import Button from 'material-ui/Button';
import NoteBody from 'Components/NoteBody/NoteBody';
import Buttons from 'Components/Buttons/Buttons';

class NoteEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state={ note: Object.assign({}, props.note) };
  }

  componentWillReceiveProps(props) {
    this.setState({ note: Object.assign({}, props.note) });
  }

  handleSave() {
    const { id, title, body } = this.state.note;
    NoteAction.update(id, { title, body  });
  }

  handleDelete() {
    if(window.confirm('Are you sure?')) {
      NoteAction.delete(this.state.note.id);
    }
  }

  handleShow() {
    this.props.history.push(`/notes/${this.state.note.id}`);
  }

  handleChangeTitle(e) {
    this.setState({ note: Object.assign({}, this.state.note, 
      { title: e.target.value }) });
  }

  handleChangeBody(e) {
    this.setState({ note: Object.assign({}, this.state.note,
      { body: e.target.value }) });
  }

  render() {
    const {classes, note} = this.props
    const {title: nextTitle, body: nextBody} = this.state.note;
    if(!note || !note.id) return null;
    const isChanged = note.title !== nextTitle || note.body !== nextBody;
    return <div className={classes.edit}>
      <div className={classes.editHead}>
        <FormControl className={classes.inputText}>
          <InputLabel htmlFor="name-simple">Title</InputLabel>
          <Input id="name-simple" value={nextTitle}
            onChange={this.handleChangeTitle.bind(this)}
        />
        </FormControl>
        <Buttons className={classes.buttons}
          changed={isChanged}
          onSave={this.handleSave.bind(this)}
          onDelete={this.handleDelete.bind(this)}
          onShow={this.handleShow.bind(this)} />
      </div>
      <div className={classes.editBody}>
        <textarea className={classes.inputArea}
          id="note-body" value={nextBody}
          onChange={this.handleChangeBody.bind(this)}/>
      </div>
      <div className={classes.editView}>
        <NoteBody body={nextBody} />
      </div>
      </div>;
  }
};

const barHeightSmUp = 112;
const barHeightSmDown = 104;
const titleHeight = 62;
const styles = theme => ({
  edit:       { display: 'flex', flexDirection: 'column'
              , height: `calc(100vh - ${barHeightSmDown}px)`
              , [theme.breakpoints.up('sm')]: {
                  height: `calc(100vh - ${barHeightSmUp}px)`
              }},
  editHead:   { display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: titleHeight, minHeight: titleHeight
              , boxSizing: 'border-box'
              , padding: '5px', borderBottom: '1px solid #CCC' },
  inputText:  { flex: '2 1 auto'},
  buttons:    { flex: '1 1 auto' },
  editBody:   { borderBottom: '1px solid #CCC' },
  inputArea:  { display: 'block', resize: 'none' 
              , height: '260px'
              , width: '100%',    boxSizing: 'border-box'
              , border: 'none',   padding: '10px'
              , fontSize: '16px', outline: 'none', resize: 'vertical'
              , maxHeight:
                `calc(100vh - ${barHeightSmDown}px - ${titleHeight}px)`
              , [theme.breakpoints.up('sm')]: {
                maxHeight:
                  `calc(100vh - ${barHeightSmUp}px - ${titleHeight}px)`
              }},
  editView:   { flex: '1 1 auto', overflow: 'auto'
              , position: 'relative'
              , padding: '20px 10px 10px 10px'
              , '&:before': {
                content: '"Preview"', display: 'inline-block'
                , position: 'absolute', top: 0, left: 0
                , backgroundColor: '#F5F5F5'
                , padding: '5px 10px', fontSize: '12px'
                , borderRight: '1px solid #CCC'
                , borderBottom: '1px solid #CCC' }}
});

NoteEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(NoteEdit);
