FROM python:3.9.7-slim

RUN pip install mysql-connector-python==8.0.29
RUN pip install starlette==0.20.0
RUN pip install uvicorn==0.17.6

COPY main.py main.py

EXPOSE 8080
CMD uvicorn main:app --host 0.0.0.0 --port 8080
