# 📚 書籍バーコード管理アプリ

スマートフォンのカメラでISBNバーコードをスキャンし、書籍情報を管理できるWebアプリケーションです。

## ✨ 特徴

- 📱 **モバイルファースト設計** - スマートフォンでの利用を最優先
- 📷 **バーコードスキャン** - html5-qrcode を使用した高速スキャン
- 📖 **書籍情報自動取得** - OpenBD API から書籍情報を自動取得
- 💾 **オフライン対応** - IndexedDB (Dexie.js) によるローカル保存
- 🎨 **レスポンシブUI** - Tailwind CSS によるモダンなデザイン
- ⚡ **高速動作** - Vite + React によるSPA

## 🛠 技術スタック

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Database:** Dexie.js (IndexedDB wrapper)
- **Libraries:**
  - html5-qrcode - バーコードスキャン
  - axios - HTTP クライアント
- **Deployment:** GitHub Pages + GitHub Actions

## 📦 セットアップ

### 前提条件

- Node.js 18.x 以上
- npm または yarn
- GITHUB_TOKEN (リポジトリ作成・Pages有効化時)

### 1. GitHub CLI のインストールと設定

GitHub CLI が未インストールの場合、自動インストールスクリプトを実行します。

```bash
# GITHUB_TOKEN を設定（https://github.com/settings/tokens/new?scopes=repo で作成）
export GITHUB_TOKEN=your_token_here

# セットアップスクリプトを実行
chmod +x setup-repo.sh
./setup-repo.sh
```

このスクリプトは以下を自動実行します：

- ✅ GitHub CLI のインストール（Linux/macOS）
- ✅ GITHUB_TOKEN による認証
- ✅ リポジトリの作成（存在しない場合）
- ✅ GitHub Pages の有効化

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### 4. ビルド

```bash
npm run build
```

dist ディレクトリにビルド成果物が生成されます。

### 5. デプロイ

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

GitHub Actions が自動的にビルドとデプロイを実行します。

数分後、`https://<your-username>.github.io/<repo-name>/` でアクセス可能になります。

## 🎯 使い方

1. **スキャンボタンをタップ** - 画面下部の「バーコードをスキャン」ボタンをタップ
2. **カメラ権限を許可** - ブラウザの権限要求で「許可」を選択
3. **バーコードをスキャン** - 書籍裏表紙のISBNバーコードをカメラに向ける
4. **自動登録** - 書籍情報が自動取得され、一覧に追加されます
5. **削除** - 不要な書籍は「削除」ボタンで削除できます

## 📁 プロジェクト構成

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions デプロイワークフロー
├── src/
│   ├── components/
│   │   ├── Scanner.tsx         # バーコードスキャナーコンポーネント
│   │   └── BookList.tsx        # 書籍一覧表示コンポーネント
│   ├── App.tsx                 # メインアプリケーション
│   ├── main.tsx                # エントリーポイント
│   ├── db.ts                   # Dexie.js データベース定義
│   ├── api.ts                  # OpenBD API クライアント
│   ├── index.css               # グローバルスタイル
│   └── vite-env.d.ts           # TypeScript型定義
├── index.html                  # HTML エントリーポイント
├── vite.config.ts              # Vite 設定
├── tailwind.config.js          # Tailwind CSS 設定
├── tsconfig.json               # TypeScript 設定
├── package.json                # npm パッケージ設定
├── setup-repo.sh               # GitHub CLI セットアップスクリプト
└── README.md                   # このファイル
```

## 🔧 開発

### スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run preview` - ビルド結果のプレビュー

### コーディング規約

- TypeScript strict mode 有効
- ESLint + Prettier 推奨
- コンポーネントは関数コンポーネント + Hooks を使用

## 🔌 API

### OpenBD API

書籍情報の取得に [OpenBD](https://openbd.jp/) を使用しています。

```
GET https://api.openbd.jp/v1/get?isbn={ISBN}
```

取得データ：
- ISBN
- タイトル
- 著者
- 表紙画像URL

## 🗄️ データベーススキーマ

IndexedDB (Dexie.js) を使用したローカルストレージ。

```typescript
interface Book {
  isbn: string;        // PRIMARY KEY
  title: string;       // 書籍タイトル
  author: string;      // 著者名
  coverImage: string;  // 表紙画像URL
  addedAt: Date;       // 登録日時
}
```

## 📱 モバイル対応

- iOS Safari / Chrome 対応
- Android Chrome / Firefox 対応
- viewport 最適化（safe-area-inset 対応）
- dvh (動的ビューポート高さ) 使用
- タッチ操作最適化

## 🤝 貢献

プルリクエスト歓迎します！

1. Fork する
2. Feature ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## 🙏 謝辞

- [OpenBD](https://openbd.jp/) - 書籍情報API
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - バーコードスキャナー
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
