import ReactDOM from "react-dom";
import React from "react";
import createCache from "react-view-cache";

const Cache = createCache({
  hooks: {
    beforeSwitch(oldId, newId) {
      console.log('before switch', oldId, newId);
    },

    afterSwitch(oldId, newId) {
      console.log('after switch', oldId, newId)
    },

    beforeAdd(id) {
      console.log('before add', id);
    },

    afterAdd(id) {
      console.log('after add', id);
    },

    beforeRemove(id) {
      console.log('before remove', id);
    },

    afterRemove(id) {
      console.log('after remove', id);
    }
  }
});

class Page extends React.Component {
  state = {
    text: '',
    display: true
  };

  render() {
    const { text, display } = this.state;

    return <div>
      <form onSubmit={::this.onSubmit}>
        <input ref="input"/>
        <button type="submit">ok</button>
      </form>

      <button onClick={() => this.setState({ display: !display })}>toggle</button>

      {display && <Cache viewId={text} view={({ isActive }) => <View isActive={isActive} text={text}/>} cacheTime={3000}/>}
    </div>
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({ text: this.refs.input.value });
  }
}

class View extends React.Component {
  componentDidMount() {
//     console.log('mount', this.props.text);
  }

  componentWillUnmount() {
//     console.log('unmount', this.props.text);
  }

  render() {
    const { text, isActive } = this.props;

//     console.log('render', text, isActive);

    return <div>
      <div>text: {text}</div>
      <div>isActive: {isActive ? 'true' : 'false'}</div>
    </div>
  }
}

ReactDOM.render(
  <Page/>,
  document.getElementById('root')
);