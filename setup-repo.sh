#!/bin/bash

set -e  # エラー時に即座に終了

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. GitHub CLI のインストールチェック
echo_info "GitHub CLI (gh) の確認中..."

if command -v gh &> /dev/null; then
    echo_success "GitHub CLI は既にインストールされています: $(gh --version | head -n1)"
else
    echo_warning "GitHub CLI が見つかりません。インストールを開始します..."

    # OS 判定
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "${OS}" in
        Linux*)
            echo_info "Linux を検出しました"

            # アーキテクチャ判定
            case "${ARCH}" in
                x86_64)
                    GH_ARCH="amd64"
                    ;;
                aarch64|arm64)
                    GH_ARCH="arm64"
                    ;;
                *)
                    echo_error "サポートされていないアーキテクチャ: ${ARCH}"
                    exit 1
                    ;;
            esac

            # 最新版のダウンロード URL（バージョン固定で安定性確保）
            GH_VERSION="2.62.0"
            GH_URL="https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_${GH_ARCH}.tar.gz"

            echo_info "GitHub CLI v${GH_VERSION} をダウンロード中..."
            curl -sL "${GH_URL}" -o /tmp/gh.tar.gz

            echo_info "展開中..."
            tar -xzf /tmp/gh.tar.gz -C /tmp

            # インストール先を決定（ユーザーローカルを優先）
            if [ -w "$HOME/.local/bin" ] || mkdir -p "$HOME/.local/bin" 2>/dev/null; then
                INSTALL_DIR="$HOME/.local/bin"
            elif [ -w "/usr/local/bin" ]; then
                INSTALL_DIR="/usr/local/bin"
            else
                echo_error "インストール先ディレクトリに書き込み権限がありません"
                exit 1
            fi

            echo_info "${INSTALL_DIR} にインストール中..."
            cp "/tmp/gh_${GH_VERSION}_linux_${GH_ARCH}/bin/gh" "${INSTALL_DIR}/"
            chmod +x "${INSTALL_DIR}/gh"

            # PATH に追加（必要な場合）
            if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
                export PATH="${INSTALL_DIR}:$PATH"
                echo_warning "注意: ${INSTALL_DIR} を PATH に追加しました（現在のセッションのみ）"
                echo_warning "永続的に設定するには ~/.bashrc または ~/.zshrc に以下を追加してください:"
                echo "export PATH=\"${INSTALL_DIR}:\$PATH\""
            fi

            # クリーンアップ
            rm -rf /tmp/gh.tar.gz "/tmp/gh_${GH_VERSION}_linux_${GH_ARCH}"

            echo_success "GitHub CLI のインストールが完了しました: $(gh --version | head -n1)"
            ;;

        Darwin*)
            echo_info "macOS を検出しました"

            if command -v brew &> /dev/null; then
                echo_info "Homebrew を使用してインストール中..."
                brew install gh
            else
                echo_error "Homebrew が見つかりません。手動でインストールしてください: https://cli.github.com/"
                exit 1
            fi
            ;;

        *)
            echo_error "サポートされていない OS: ${OS}"
            echo_error "手動でインストールしてください: https://cli.github.com/"
            exit 1
            ;;
    esac
fi

# 2. GITHUB_TOKEN の確認
echo_info "GITHUB_TOKEN の確認中..."

if [ -z "$GITHUB_TOKEN" ]; then
    echo_error "GITHUB_TOKEN 環境変数が設定されていません"
    echo "以下のコマンドで設定してください:"
    echo "  export GITHUB_TOKEN=your_token_here"
    echo ""
    echo "トークンは以下のURLで作成できます:"
    echo "  https://github.com/settings/tokens/new?scopes=repo"
    exit 1
fi

echo_success "GITHUB_TOKEN が設定されています"

# 3. GitHub 認証
echo_info "GitHub に認証中..."

# gh auth status で認証状態を確認（エラーメッセージを非表示）
if gh auth status &> /dev/null; then
    echo_success "既に認証済みです"
else
    echo_info "トークンで認証中..."
    echo "$GITHUB_TOKEN" | gh auth login --with-token
    echo_success "認証に成功しました"
fi

# 4. 現在のユーザー名を取得
GITHUB_USER=$(gh api user -q .login)
echo_info "GitHub ユーザー: ${GITHUB_USER}"

# 5. リポジトリ名を取得（カレントディレクトリ名を使用）
REPO_NAME=$(basename "$(pwd)")
echo_info "リポジトリ名: ${REPO_NAME}"

# 6. リポジトリの存在確認と作成
echo_info "リポジトリの確認中..."

if gh repo view "${GITHUB_USER}/${REPO_NAME}" &> /dev/null; then
    echo_warning "リポジトリ ${GITHUB_USER}/${REPO_NAME} は既に存在します"
else
    echo_info "リポジトリを作成中..."
    gh repo create "${REPO_NAME}" --public --source=. --remote=origin --push
    echo_success "リポジトリを作成しました: https://github.com/${GITHUB_USER}/${REPO_NAME}"
fi

# 7. GitHub Pages の有効化
echo_info "GitHub Pages の設定中..."

# GitHub Pages の有効化（gh-pages ブランチから公開）
# まず gh-pages ブランチの存在確認
if gh api "repos/${GITHUB_USER}/${REPO_NAME}/pages" &> /dev/null; then
    echo_warning "GitHub Pages は既に有効化されています"
else
    echo_info "GitHub Pages を有効化中..."

    # GitHub Actions からのデプロイを許可する設定
    gh api --method POST "repos/${GITHUB_USER}/${REPO_NAME}/pages" \
        -f source[branch]=gh-pages \
        -f source[path]=/ \
        || echo_warning "GitHub Pages の有効化に失敗しました（手動で設定が必要な場合があります）"

    echo_success "GitHub Pages が有効化されました"
    echo_info "公開URL: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
fi

echo ""
echo_success "========================================="
echo_success "  セットアップが完了しました！"
echo_success "========================================="
echo ""
echo_info "次のステップ:"
echo "  1. npm install        # 依存関係のインストール"
echo "  2. npm run build      # ビルド"
echo "  3. git add ."
echo "  4. git commit -m 'Initial commit with app'"
echo "  5. git push -u origin main"
echo "  6. GitHub Actions がデプロイを自動実行します"
echo ""
echo_info "公開URL: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
