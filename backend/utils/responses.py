from typing import Any, Optional

def success_response(data: Any = None, message: str = "Success"):
    """Standard success response format"""
    response = {
        "success": True,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return response

def error_response(message: str, code: str = "ERROR"):
    """Standard error response format"""
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message
        }
    }

def paginated_response(items: list, page: int, total_pages: int, total_items: int):
    """Paginated response format"""
    return {
        "success": True,
        "data": {
            "items": items,
            "pagination": {
                "currentPage": page,
                "totalPages": total_pages,
                "totalItems": total_items
            }
        }
    }