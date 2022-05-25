FROM python:3.9.7-slim

RUN pip install uvicorn==0.17.6
RUN pip install databases==0.5.5
RUN pip install fastapi==0.78.0
RUN pip install aiomysql==0.1.1
RUN pip install cryptography==37.0.2

COPY main.py main.py

EXPOSE 8080
CMD uvicorn main:app --host 0.0.0.0 --port 8080
