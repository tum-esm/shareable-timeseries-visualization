.venv/bin/pip freeze > requirements.txt
docker build --platform linux/amd64 -t gcr.io/tum-esm/stv-backend .
docker push gcr.io/tum-esm/stv-backend:latest
rm requirements.txt

COMMIT_SHA="$(git rev-parse --short --verify HEAD)"
gcloud run deploy frontend \
    --image=gcr.io/tum-esm/stv-backend:latest \
    --platform managed --no-traffic \
    --tag "commit-$COMMIT_SHA"
