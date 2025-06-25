from breeze_connect import BreezeConnect

breeze = None

def initialize_breeze_session(api_key: str, secret_key: str, session_token: str):
    global breeze
    try:
        breeze = BreezeConnect(api_key=api_key)
        breeze.generate_session(api_secret=secret_key, session_token=session_token)
        print("✅ Breeze session initialized.")
        return True, "Session initialized successfully"
    except Exception as e:
        print(f"❌ Failed to initialize session: {e}")
        breeze = None
        return False, str(e)

def get_breeze():
    return breeze

print("✔️ breeze.py loaded")
