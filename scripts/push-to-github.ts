// GitHub integration script for pushing code to a repository
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function main() {
  const repoName = process.argv[2] || 'procureflow';
  
  console.log('Getting GitHub access token...');
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  console.log('Getting authenticated user...');
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);
  
  let repoExists = false;
  try {
    await octokit.repos.get({ owner: user.login, repo: repoName });
    repoExists = true;
    console.log(`Repository ${user.login}/${repoName} already exists.`);
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`Creating new repository: ${repoName}...`);
      await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        private: true,
        description: 'ProcureFlow - Purchase Order Management System',
      });
      console.log(`Repository created: ${user.login}/${repoName}`);
    } else {
      throw e;
    }
  }
  
  const remoteUrl = `https://${accessToken}@github.com/${user.login}/${repoName}.git`;
  
  try {
    execSync('git remote remove github-push 2>/dev/null || true', { stdio: 'pipe' });
    execSync(`git remote add github-push "${remoteUrl}"`, { stdio: 'pipe' });
  } catch (e) {
    // Remote might already exist
  }
  
  console.log('Pushing code to GitHub...');
  try {
    execSync('git push -u github-push main --force', { stdio: 'inherit' });
    console.log(`\nSuccess! Code pushed to: https://github.com/${user.login}/${repoName}`);
  } catch (e) {
    // Try master branch if main doesn't exist
    try {
      execSync('git push -u github-push master --force', { stdio: 'inherit' });
      console.log(`\nSuccess! Code pushed to: https://github.com/${user.login}/${repoName}`);
    } catch (e2) {
      console.error('Failed to push. Make sure you have commits in your repository.');
      throw e2;
    }
  }
  
  // Clean up the remote with token
  execSync('git remote remove github-push 2>/dev/null || true', { stdio: 'pipe' });
}

main().catch(console.error);
