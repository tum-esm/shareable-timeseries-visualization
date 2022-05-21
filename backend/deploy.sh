docker build --platform linux/amd64 -t gcr.io/tum-esm/stv-backend .
docker push gcr.io/tum-esm/stv-backend:latest

COMMIT_SHA="$(git rev-parse --short --verify HEAD)"
gcloud run deploy stv-backend \
    --image=gcr.io/tum-esm/stv-backend:latest \
    --platform managed --tag "commit-$COMMIT_SHA"
