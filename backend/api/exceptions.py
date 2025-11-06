# api/exceptions.py
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging, uuid

log = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    resp = drf_exception_handler(exc, context)
    if resp is not None:
        return resp

    rid = str(uuid.uuid4())
    view = context.get("view")
    log.exception("Unhandled error [%s] in %s: %s", rid, getattr(view, "__class__", view), exc)
    return Response({"error": "INTERNAL_ERROR", "request_id": rid}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
