#!/bin/bash

echo "🚀 Starting deployment process..."

# ビルドテスト
echo "📦 Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# TypeScriptチェック
echo "🔍 Checking TypeScript..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript check failed!"
    exit 1
fi

# Gitステータス確認
echo "📊 Checking git status..."
git status

# ユーザーにコミットメッセージを求める
echo "✏️  Enter commit message:"
read commit_message

# Git操作
echo "📝 Committing changes..."
git add .
git commit -m "$commit_message"

echo "⬆️  Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated! Check Vercel dashboard for status."
echo "🌐 URL: https://surveyor-exam-app.vercel.app/"