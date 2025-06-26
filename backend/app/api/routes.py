from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from app.core.breeze import initialize_breeze_session
from app.core.breeze import breeze 
from app.core.breeze import get_breeze

router = APIRouter()

class InitSessionRequest(BaseModel):
    api_key: str
    secret_key: str
    session_token: str

@router.post("/init-session")
def init_session(data: InitSessionRequest):
    print(data)
    success, message = initialize_breeze_session(
        api_key=data.api_key,
        secret_key=data.secret_key,
        session_token=data.session_token
    )
    if success:
        return {"success": True, "message": message}
    raise HTTPException(status_code=400, detail=message)

class HistoricalDataRequest(BaseModel):
    interval: str
    from_date: str
    to_date: str
    stock_code: str
    exchange_code: str
    product_type: str
    expiry_date: str
    right: Literal["call", "put"]
    strike_price: str


@router.post("/historical")
def get_historical_data(data: HistoricalDataRequest):
    print(data)
    breeze = get_breeze()
    try:
        response = breeze.get_historical_data_v2(
            interval=data.interval,
            from_date=data.from_date,
            to_date=data.to_date,
            stock_code=data.stock_code,
            exchange_code=data.exchange_code,
            product_type=data.product_type,
            expiry_date=data.expiry_date,
            right=data.right,
            strike_price=data.strike_price
        )
        return {"success": True, "data": response.get("Success", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
