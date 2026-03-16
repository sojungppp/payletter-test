# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js AWS Lambda function that generates S3 presigned URLs for image uploads. It is used as a backend API gateway handler for uploading images to specific S3 directories.

## Architecture

Single-file Lambda (`index.js`):
- Reads `ext` (file extension) and `dir` (target directory: `"user"` or `"store"`) from API Gateway query string parameters
- Generates a unique image key using timestamp + random string
- Returns an S3 presigned PUT URL (expires in 1 hour) and the resulting image key

AWS SDK v2 (`aws-sdk`) is used. Credentials and configuration come from environment variables:
- `REGION` — AWS region
- `ACCESS_KEY` — AWS access key ID
- `SECRET_KEY` — AWS secret access key
- `IMAGE_BUCKET` — S3 bucket name

## Environment Variables

Set these before local testing or in the Lambda console:

```
REGION=ap-northeast-2
ACCESS_KEY=...
SECRET_KEY=...
IMAGE_BUCKET=...
```

## Local Development

No package.json is committed. To install dependencies:

```bash
npm init -y
npm install aws-sdk
```

To invoke locally with the SAM CLI:

```bash
sam local invoke -e event.json
```
