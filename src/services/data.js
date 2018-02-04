module.exports = [
  {
    "id": 1,
    "title": "Babel 6.xでErrorとかArrayをextendsしたときの挙動がおかしい",
    "updated": "2016-04-26 11:16:45",
    "body": "```javascript\nclass FooError extends Error {}\nconsole.log(new FooError() instanceof FooError); //=> false\nconsole.log(new FooError() instanceof Error); //=> true\n\nclass FooArray extends Array {}\nconsole.log(new FooArray() instanceof FooArray); //=> false\nconsole.log(new FooArray() instanceof Array); //=> true\n```\n\nサポートしてないらしい。  \nhttps://phabricator.babeljs.io/T3083",
    "user": "MyUserName"
  },
  {
    "id": 10,
    "title": "Gitで2つ以上前のコミットに統合する",
    "updated": "2015-07-14 10:01:05",
    "body": "一つ前のコミットに統合するのは`git commit --amend -C HEAD`とかでいけるんだけど2つ以上前になるとめんどい。\n\n<blockquote class=\"twitter-tweet\" lang=\"ja\"><p lang=\"ja\" dir=\"ltr\">Gitでちょっとした修正を2つ以上前のコミットに統合したいとき、適当な名前でコミットしてrebase -iでfixupしてるけどめんどいので一発でやりたい</p>&mdash; Kazuhito Hokamura (@hokaccha) <a href=\"https://twitter.com/hokaccha/status/620851123566448640\">2015, 7月 14</a></blockquote>\n\nCTO殿にautosquashを教えてもらった。\n\n<blockquote class=\"twitter-tweet\" lang=\"ja\"><p lang=\"ja\" dir=\"ltr\"><a href=\"https://twitter.com/hokaccha\">@hokaccha</a> 僕はtigでコミットを選択したらcommit --fixupでコミットできるようにキーバインドをあてて使ってます。あとrebase -i --autosquash&#10;&#10;<a href=\"https://t.co/xFABtYXVFT\">https://t.co/xFABtYXVFT</a></p>&mdash; yuku takahashi (@yuku_t) <a href=\"https://twitter.com/yuku_t/status/620860114975657984\">2015, 7月 14</a></blockquote>\n\nこういうやつ。\n\nhttp://qiita.com/kyanro@github/items/818012c1b1827ed48277\n\nしかし`rebase -i --autosquash`はエディタ立ち上がって一発でできる感じじゃないのでどうにかできないかなと思って調べたら`GIT_EDITOR=:`って指定するとGitのエディタ起動する部分をそのまま保存して終了っていう動作になるらしいのでこれを使えばいけそうというのがわかった。\n\n```\n$ GIT_EDITOR=: git rebase -i --autosquash $COMMIT\n```\n\nこんな感じのaliasを作る。\n\n```\n[alias]\n\tfixup = !sh -c 'COMMIT=`git rev-parse ${1:-HEAD}` && git commit --fixup=$COMMIT && GIT_EDITOR=: git rebase -i --autosquash ${COMMIT}^' -\n```\n\nこれで変更を`git add`した状態で\n\n```\n$ git fixup         # 一つ前（HEAD）と統合\n$ git fixup HEAD^   # 二つ前と統合\n$ git fixup <sha1>  # 指定のコミットと統合\n```\n\nって感じになる。\n\nrebaseでコンフリクトしてabortしたりするとfixupなコミットが残るけどまあそのぐらいはいいかな。",
    "user": "MyUserName"
  },
  {
    "id": 2,
    "title": "GraphQLでNonNullなList",
    "updated": "2016-04-24 12:32:50",
    "body": "1. フィールド自身がNonNull\n2. 要素がNonNull\n3. その両方\n\nがあって\n\n```javascript\nlet QueryType = new GraphQLObjectType({\n  name: 'Query',\n  fields: {\n    list1: {\n      type: new GraphQLNonNull(new GraphQLList(GraphQLString)),\n      resolve: () => arr1,\n    },\n    list2: {\n      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),\n      resolve: () => arr2,\n    },\n    list3: {\n      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),\n      resolve: () => arr3,\n    },\n  },\n});\n```\n\nGraphQLの型で表現するとこうなる。\n\n```\ntype Query {\n  list1: [String]!\n  list2: [String!]\n  list3: [String!]!\n}\n```\n\n違いはこんな感じ\n\n* list1\n  * `null` : NG\n  * `['foo', null]` : OK\n  * `[]` : OK\n* list2\n  * `null` : OK\n  * `['foo', null]` : NG\n  * `[]` : OK\n* list3\n  * `null` : NG\n  * `['foo', null]` : NG\n  * `[]` : OK",
    "user": "MyUserName"
  },
  {
    "id": 3,
    "title": "ES6でN個の配列",
    "updated": "2016-03-21 21:02:10",
    "body": "Array.prototype.keysはIteratorを返すのでArray.fromに食わせる\n\n```javascript\nArray.from(Array(5).keys()); //=> [0, 1, 2, 3, 4]\n```\n\nもしくは\n\n```javascript\nArray.from({ length: 5 }).map((v, k) => k); //=> [0, 1, 2, 3, 4]\n```\n\nArray.fromの第二引数はmap的な役割があるので\n\n```javascript\nArray.from({ length: 5 }, (v, k) => k); //=> [0, 1, 2, 3, 4]\n```\n\nこんな感じ。\n\n[追記] 便利。\n\nhttp://b.hatena.ne.jp/entry/283745891/comment/wakuworks",
    "user": "MyUserName"
  },
  {
    "id": 4,
    "title": "ShadowDOMの外から内部の要素を取得する",
    "updated": "2016-03-21 23:12:30",
    "body": "`shadowRoot`でshadowRootが取れるのでそこから辿れる。\n\n```javascript\nvar proto = Object.create(HTMLElement.prototype);\nproto.createdCallback = function() {\n  var shadowRoot = this.createShadowRoot(); \n  shadowRoot.innerHTML = '<span class=\"foo\">text</span>';\n};\n\ndocument.registerElement('x-element', { prototype: proto });\n\nvar el = document.createElement('x-element');\n\n// これで取れる\nconsole.log(el.shadowRoot.querySelector('.foo').textContent); //=> text\n```",
    "user": "MyUserName"
  },
  {
    "id": 5,
    "title": "Shadow-Piercing descendant combinator is deprecated",
    "updated": "2016-03-10 18:32:00",
    "body": "最近Web Componentsのアップデート全然見てなかったけどCSSで外からShadow DOMをスタイリングするための`/deep/`（`>>>`）、`::shadow`がdeprecatedになってた。\n\n[Shadow-Piercing descendant combinator, '/deep/' (aka '>>>') - Chrome Platform Status](https://www.chromestatus.com/feature/6750456638341120)",
    "user": "MyUserName"
  },
  {
    "id": 6,
    "title": "小さいReactアプリケーションのためのライブラリ書いた",
    "updated": "2016-03-18 22:10:42",
    "body": "[EventEmitterバケツリレースタイル/フレームワークなしで小さくFluxする - Qiita](http://qiita.com/mizchi/items/6a3500e598ec36746509)\n\nこれ見て最近は大体自分も同じような感じのことをしているので共通化できる最小限のコードをライブラリにしてみた。\n\nhttps://github.com/hokaccha/react-micro-container\n\n元記事でも言ってるようにやることはとても少ないのでライブラリ使わないでもいいんだけどそのへんは好み。\n\n## Usage\n\nまず普通のステートレスなReactコンポーネントを作る。`dispatch`という`props`を受け取ってそれを通してイベントを発火するというのが唯一の規約。\n\n```javascript:components/counter.js\nimport React from 'react';\n\n// Stateless component\nexport default class Counter extends React.Component {\n  render() {\n    return (\n      <div>\n        <div>{this.props.count}</div>\n        <button onClick={() => this.props.dispatch('increment', 1)}>+1</button>\n        <button onClick={() => this.props.dispatch('decrement', 1)}>-1</button>\n        <button onClick={() => this.props.dispatch('increment', 100)}>+100</button>\n      </div>\n    );\n  }\n}\n```\n\nそれをwrapするコンテナコンポーネントを作る。こいつはstateを持ち、子のコンポーネントに`dispatch`を渡してイベントをsubscribeし、適時stateを更新する。\n\n```javascript:container/counter.js\nimport MicroContainer from 'react-micro-container';\nimport Counter from '../components/counter';\n\nexport default class CounterContainer extends MicroContainer {\n  constructor(props) {\n    super(props);\n    this.state = { count: 0 };\n  }\n\n  componentDidMount() {\n    this.subscribe({\n      increment: this.handleIncrement,\n      decrement: this.handleDecrement,\n    });\n  }\n\n  handleIncrement(count) {\n    this.setState({ count: this.state.count + count });\n  }\n\n  handleDecrement(count) {\n    this.setState({ count: this.state.count - count });\n  }\n\n  render() {\n    return <Counter dispatch={this.dispatch} {...this.state} />;\n  }\n}\n```\n\nこのコンポーネントも単なるReact Componentなのでこのコンテナを普通にマウントするだけ。\n\n```javascript:app.js\nimport ReactDOM from 'react-dom';\nimport CounterContainer from './container/counter';\n\nReactDOM.render(<CounterContainer />, document.getElementById('app'));\n```\n\nAjaxしたり何なりも全部コンテナでやる。汚い部分を全部コンテナが引き受けることでコンポーネントの世界をきれいに保つことができる。そして覚えるのは`dispatch`と`subscribe`だけで、あとは普通にReact使うのと変わらないというのが利点。\n\n大きくなったらFlux的なの使おう。\n\n## 実際に使ってみたか\n\n[Adventar](http://www.adventar.org/)をこれで書き換えてみた。オレオレFlux的な感じでやってたけど、そんなにコード量多くないのでこれで書き換えてだいぶすっきりした。",
    "user": "MyUserName"
  },
  {
    "id": 7,
    "title": "ESLintの設定をscoped packageでnpmにあげて使い回す",
    "updated": "2016-04-07 11:48:22",
    "body": "ESLintがv2にアップデートしてからけっこう変わって、だましだましv1系の設定をいじりながら使い続きてたけどだいぶカオスになってきたので気合入れて書き直した。\n\nhttps://github.com/hokaccha/eslint-config\n\nせっかく気合入れて書いたのでプロジェクトを横断して設定を共有できるようにしたい。\n\nESLintの設定を使い回すのはいくつか方法が考えられる。\n\n1. プロジェクトごとにコピペする\n2. npmモジュールにしてextendする\n\nさらにnpmモジュールとして利用するのはいくつか方法があって、\n\n1. `eslint-config-hokaccha`みたいにグローバルな名前でnpmにpublishして使う\n2. scoped packageとして`@hokaccha/eslint-config`みたいな名前でnpmにpublishして使う\n3. githubに置いといて`npm install hokaccha/eslint-config`みたいにして使う\n\nたぶん1が一番メジャーな方法で、[eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb)とか[eslint-config-standard](https://www.npmjs.com/package/eslint-config-standard)あたりが有名どころ。そうすると`.eslintrc`では\n\n```json:.eslintrc\n{\n  \"extends\": \"airbnb\"\n}\n```\n\nみたいにするだけでその設定を使いまわせる。\n\nhttp://eslint.org/docs/user-guide/configuring#extending-configuration-files\n\nなので`eslint-config-hokaccha`みたいな名前でpublishしてもいいんだけど、グローバルなネームスペースに個人の設定あげるのも何か気が引ける（個人の名前でpublishしてる人もけっこういるしそんなに問題にはならないと思うけど気持ちの問題）。\n\nそこでscoped packageでpublishすることにした[^1]。scoped packageについてはazuさんの記事を参照のこと。\n\n[^1]: 知らなかったんだけどteppeisさんに教えてもらった\n\n[npmで名前空間を持ったモジュールを公開する方法(scoped modules) | Web Scratch](http://efcl.info/2015/04/30/npm-namespace/)\n\nこんな感じでnpmにpublishした。\n\nhttps://www.npmjs.com/package/@hokaccha/eslint-config\n\nインストールして\n\n```\n$ npm install --save-dev eslint @hokaccha/eslint-config\n```\n\nextendするだけ。\n\n```json:.eslintrc\n{\n  \"extends\": [\"@hokaccha/eslint-config\"]\n}\n```\n\nこれで気合入れて書いた設定を共有できるしアップデートにも追従できる。便利。",
    "user": "MyUserName"
  },
  {
    "id": 8,
    "title": "Herokuでreact-railsのサーバーサイドレンダリングがTimeoutしてハマった話",
    "updated": "2016-02-02 23:10:01",
    "body": "react-railsでサーバーサイドレンダリングを有効にしてHerokuにデプロイしたらリクエストがタイムアウトでエラーになるようになった。Rails内でV8動かしてるからさすがにメモリ足りないのかなーと思って2X dynoにしてみたけどダメで、Performance-L dynoっていう14GB RAMの最強のやつ（$500/month）にしたらギリギリ返ってくるようになった。\n\nが、よくよく考えてみるとそんなにメモリ必要なわけないよなーと思って、コード読んだりしてみた結果、browserifyのビルドがリクエスト中に実行されるのが原因だった。\n\nreact-railsはサーバーサイドのRednererを`config.react.server_renderer`で入れ替えられるようになっていて、これのデフォルトが`SprocketsRenderer`っていうやつで、こいつはリクエスト時にSprocketsのビルドを実行してサーバーサイドレンダリング用のコードを生成するってやつになっている。\n\nで、今回browserify-railsっていうSprockets内でbrowserifyを実行してビルドするっていうgemを使っていたせいで、リクエスト内でbrowserifyのビルドが走ってTimeoutしていた。\n\nこれを解決するのに、こんな感じのRendererを書いた。\n\n```ruby:lib/autoload/server_renderer.rb\nclass ServerRenderer < React::ServerRendering::ExecJSRenderer\n  def initialize(options = {})\n    super(options.merge(code: js_code))\n  end\n\n  def render(component_name, props, prerender_options)\n    if !props.is_a?(String)\n      props = props.to_json\n    end\n\n    super(component_name, props, render_function: 'renderToString')\n  end\n\n  private\n\n  def js_code\n    manifest_dir = Rails.application.assets_manifest.dir\n    filename = Rails.application.assets_manifest.assets[\"components.js\"]\n    filepath = File.join(manifest_dir, filename)\n    File.read(filepath)\n  end\nend\n```\n\nこれは何をしているかというと、サーバーサイドレンダリング用のJS（`components.js`）をassets:precompileでデプロイ時にビルドしておいて、そのコードをmanifestから探してきてセットしているだけ。\n\nんでproductionではこいつをRendererに指定する。\n\n```ruby:config/initializers/react.rb\nif Rails.env.production?\n  Rails.configuration.react.server_renderer = ServerRenderer\nelse\n  Rails.configuration.react.server_renderer_options[:files] = [\"components.js\"]\nend\n```\n\nこれでHerokuのHobbyプランでも全く問題なくサーバーサイドレンダリングが動くようになった。",
    "user": "MyUserName"
  },
  {
    "id": 9,
    "title": "browserify + npmでReactを使う場合はNODE_ENVを設定するとよい",
    "updated": "2015-07-29 02:10:09",
    "body": "Reactの内部には次のようなコードがいたるところにある。\n\n```js\nif (\"production\" !== process.env.NODE_ENV) {\n  console.log('debug message');\n}\n```\n\nあらかじめビルド済みのreact.min.jsとかを使う場合はすでにproductionモードでビルドされてるので気にしなくていいけど、browserifyで自分でReactをビルドする場合は`NODE_ENV`を設定する必要がある。\n\nのでproductionでは次のように環境変数を設定して実行するとよい。\n\n```\n$ NODE_ENV=production browserify src/app.js -o bundle.js\n```\n\nこのようにしてビルドすると、Reactが[envify](https://github.com/hughsk/envify)というtransform packageを使っているため、次のように変換される。\n\n```js\nif (\"production\" !== \"production\") {\n  console.log('debug message');\n}\n```\n\nさらにこれを[uglify](https://github.com/mishoo/UglifyJS2)にかけてminifyするとここに到達することはないdead codeということでコード自体を削ってくれる。",
    "user": "MyUserName"
  }
]