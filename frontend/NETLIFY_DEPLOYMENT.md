# Netlify Deployment Guide

This guide will help you deploy the frontend to Netlify.

## Prerequisites

- A Netlify account (sign up at https://www.netlify.com)
- Your backend deployed on Render (get the URL)
- Git repository with your code

## Step 1: Set Up Environment Variables

1. **Get your backend URL**
   - Go to your Render dashboard
   - Copy your backend service URL (e.g., `https://your-backend.onrender.com`)

2. **In Netlify Dashboard:**
   - Go to your site → **Site settings** → **Environment variables**
   - Click **Add a variable**
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://your-backend.onrender.com` (your actual Render backend URL)
   - Click **Save**

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended for first time)

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Click **Add new site** → **Import an existing project**

2. **Connect to Git**
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Authorize Netlify to access your repositories
   - Select your repository

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: `20` (or latest LTS)

4. **Set Environment Variables**
   - Click **Show advanced** → **New variable**
   - Add `VITE_API_URL` with your backend URL
   - Click **Deploy site**

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

4. **Initialize and deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

## Step 3: Verify Deployment

1. **Check your site URL**
   - Netlify will provide a URL like `https://your-site-name.netlify.app`
   - Visit the URL to verify it's working

2. **Test API Connection**
   - Try logging in or making an API request
   - Check browser console for any CORS errors

## Step 4: Update Backend CORS Settings

Make sure your backend `CORS_ALLOWED_ORIGINS` includes your Netlify URL:

1. **Go to Render Dashboard** → Your backend service → **Environment**
2. **Update `CORS_ALLOWED_ORIGINS`**:
   ```
   https://your-site-name.netlify.app
   ```
   Or if you have a custom domain:
   ```
   https://your-custom-domain.com
   ```

## Step 5: Custom Domain (Optional)

1. **In Netlify Dashboard:**
   - Go to **Domain settings**
   - Click **Add custom domain**
   - Enter your domain name
   - Follow DNS configuration instructions

2. **Update Environment Variables:**
   - Update `CORS_ALLOWED_ORIGINS` in Render to include your custom domain

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors
- **Solution**: Make sure `CORS_ALLOWED_ORIGINS` in Render includes your Netlify URL
- Check that `VITE_API_URL` is set correctly in Netlify

### Issue: 404 errors on page refresh
- **Solution**: The `_redirects` file should handle this. Make sure it's in `frontend/public/`

### Issue: Build fails
- **Solution**: 
  - Check Node version (should be 20 or latest LTS)
  - Verify `package.json` has correct build script
  - Check build logs in Netlify dashboard

### Issue: Environment variables not working
- **Solution**: 
  - Make sure variable name starts with `VITE_` (required for Vite)
  - Redeploy after adding environment variables
  - Check that variables are set for production environment

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://your-backend.onrender.com` |

## Build Configuration

- **Base directory**: `frontend` (if deploying from repo root)
- **Build command**: `npm install && npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: `20` (or latest LTS)

## Files Created for Deployment

- `netlify.toml` - Netlify configuration file
- `public/_redirects` - SPA routing redirects
- This guide - Deployment instructions

## Next Steps

After successful deployment:
1. Test all features (login, signup, CRUD operations)
2. Monitor error logs in Netlify dashboard
3. Set up custom domain if needed
4. Configure HTTPS (automatically handled by Netlify)

