# Troubleshooting CI checkout errors

Some CI runs have been failing before the build even starts with logs similar to:

```
Run actions/checkout@v4
fatal: unable to access 'https://github.com/Polewiak/boopclicker-web/': The requested URL returned error: 500
```

or:

```
fatal: unable to access 'https://github.com/Polewiak/boopclicker-web/': The requested URL returned error: 503
```

These messages originate from GitHub's infrastructure while `actions/checkout` is fetching
repository data. They indicate a temporary outage on GitHub's side rather than a problem
with this repository or its history—the failure occurs before any workflow code can run.

## Recommended steps

1. **Retry the workflow** – in most cases the second or third attempt succeeds once the
   GitHub service recovers.
2. **Check the GitHub Status page** – https://www.githubstatus.com – to confirm whether
   there is an ongoing incident affecting git or Actions traffic.
3. **If cloning locally**, make sure outbound HTTPS traffic is allowed and retry after a
   short delay. Intermittent proxy/network issues can manifest the same way.

No changes to the repository files are necessary for this error; re-running the job after
GitHub resolves the temporary outage is sufficient.

## When to escalate

If repeated retries over the course of ~30 minutes still fail with the same 500/503
message, capture the workflow URL and the full Actions log and report it via
https://support.github.com/contact. Include the approximate UTC time of the failures so
GitHub Support can correlate the request with their internal telemetry.
