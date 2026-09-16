import asyncio
from app.mcp_server import evaluate_interview_response

async def main():
    try:
        res = await evaluate_interview_response("Tell me about a time you had an upset customer.", text_response="I stayed calm and listened.")
        print("Success:", res)
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(main())
