---
title: OneF1 Telemetry Backend
emoji: 🏎️
colorFrom: red
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# OneF1 Telemetry Backend

This is the FastAPI backend service for the OneF1 Formula 1 Analytics and Telemetry application. It processes Formula 1 timing and telemetry data utilizing the `fastf1` library, caches the data, and exposes endpoints for the Next.js frontend.

## Deploying to Hugging Face Spaces

1. Create a new Space on [Hugging Face](https://huggingface.co/spaces).
2. Set **SDK** to **Docker** (choose the "Blank" template, do not select any pre-configured template).
3. Set the space visibility to **Public** (so your frontend can query it).
4. Upload all files from the `python-backend/` directory (including this `README.md`, `Dockerfile`, `main.py`, and `requirements.txt`) into your Space repository.
5. Hugging Face will automatically detect this `README.md`'s frontmatter and build your container using the `Dockerfile` on port `7860`.

## Connecting Your Next.js Frontend

Once your Space is built and running:
1. Copy the **Direct URL** of your space (it looks like `https://<your-username>-<your-space-name>.hf.space`).
2. Add this URL as an environment variable to your Next.js deployment (on Vercel):
   ```env
   PYTHON_BACKEND_URL=https://<your-username>-<your-space-name>.hf.space
   ```
