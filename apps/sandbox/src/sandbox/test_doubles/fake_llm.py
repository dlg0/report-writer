import json
from ..core.llm_client import BaseLLMClient


class FakeLLM(BaseLLMClient):
    """
    Deterministic LLM for testing.
    Returns predictable responses based on input.
    """

    def __init__(self, response_map: dict | None = None):
        self.response_map = response_map or {}
        self.call_count = 0
        self.last_messages = None

    async def complete(self, messages: list[dict]) -> str:
        self.call_count += 1
        self.last_messages = messages

        last_message = messages[-1]["content"].lower() if messages else ""

        for keyword, response in self.response_map.items():
            if keyword.lower() in last_message:
                if isinstance(response, dict):
                    return json.dumps(response)
                return response

        return json.dumps(self._default_response(last_message))

    def _default_response(self, message: str) -> dict:
        if "rewrite" in message or "edit" in message:
            return {
                "message": "I've updated the content as requested.",
                "proposedEdits": [
                    {
                        "type": "block",
                        "id": "block-1",
                        "action": "update",
                        "content": "Rewritten content based on the request.",
                    }
                ],
            }
        elif "add" in message or "create" in message:
            return {
                "message": "I've created the new content.",
                "proposedEdits": [
                    {
                        "type": "section",
                        "id": "new-section",
                        "action": "create",
                        "content": "New section content.",
                    }
                ],
            }
        elif "delete" in message or "remove" in message:
            return {
                "message": "I've removed the content as requested.",
                "proposedEdits": [
                    {
                        "type": "block",
                        "id": "block-1",
                        "action": "delete",
                    }
                ],
            }
        else:
            return {
                "message": "I understand your request.",
                "proposedEdits": [],
            }

    def reset(self):
        self.call_count = 0
        self.last_messages = None
