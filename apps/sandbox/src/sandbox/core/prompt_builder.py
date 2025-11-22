import json
from typing import Any


def build_agent_prompt(
    thread_messages: list[dict], context: dict
) -> list[dict[str, str]]:
    """
    Build prompt for LLM with:
    - System message explaining the task
    - Conversation history from thread
    - Relevant sections and blocks from context
    - Instructions for response format
    - Examples of proposed edits format

    Returns list of message dicts for LLM
    """
    messages = []

    system_prompt = _build_system_prompt()
    messages.append({"role": "system", "content": system_prompt})

    context_prompt = _build_context_prompt(context)
    if context_prompt:
        messages.append({"role": "system", "content": context_prompt})

    for msg in thread_messages:
        role = "user" if msg.get("role") == "user" else "assistant"
        content = msg.get("content", "")
        if content:
            messages.append({"role": role, "content": content})

    return messages


def _build_system_prompt() -> str:
    return """You are an AI assistant helping users edit research reports.

Your task is to respond to user requests by proposing edits to sections and blocks in the report.

When responding:
1. Understand the user's request and the current report context
2. Propose specific edits to sections or blocks
3. Return your response in JSON format with the following structure:

{
  "message": "A brief explanation of what you're proposing",
  "proposedEdits": [
    {
      "type": "section" | "block",
      "id": "section-id" or "block-id",
      "action": "update" | "create" | "delete",
      "content": "new content" (for update/create actions)
    }
  ]
}

Examples:

User: "Rewrite the introduction to be more concise"
Response:
{
  "message": "I've made the introduction more concise while preserving the key points.",
  "proposedEdits": [
    {
      "type": "block",
      "id": "intro-block-1",
      "action": "update",
      "content": "This study examines the impact of climate change on biodiversity."
    }
  ]
}

User: "Add a conclusion section"
Response:
{
  "message": "I've added a conclusion section summarizing the key findings.",
  "proposedEdits": [
    {
      "type": "section",
      "id": "conclusion",
      "action": "create",
      "content": "## Conclusion\\n\\nThis research demonstrates..."
    }
  ]
}

Always return valid JSON. Do not include any text outside the JSON structure."""


def _build_context_prompt(context: dict) -> str:
    """Build context information from sections, blocks, and artifacts."""
    if not context:
        return ""

    parts = ["Current report context:"]

    sections = context.get("sections", [])
    if sections:
        parts.append("\nSections:")
        for section in sections:
            parts.append(f"- {section.get('id')}: {section.get('title', 'Untitled')}")

    blocks = context.get("blocks", [])
    if blocks:
        parts.append("\nBlocks:")
        for block in blocks:
            block_id = block.get("id")
            block_type = block.get("type", "unknown")
            content = block.get("content", "")
            truncated = content[:200] + "..." if len(content) > 200 else content
            parts.append(f"- {block_id} ({block_type}): {truncated}")

    artifacts = context.get("artifacts", [])
    if artifacts:
        parts.append("\nArtifacts:")
        for artifact in artifacts:
            parts.append(f"- {artifact.get('id')}: {artifact.get('name', 'Unnamed')}")

    return "\n".join(parts)


def truncate_context(context: dict, max_tokens: int = 8000) -> dict:
    """
    Truncate large documents to fit in context window.
    Uses rough approximation: 1 token ≈ 4 characters
    """
    max_chars = max_tokens * 4

    truncated = {
        "sections": context.get("sections", []),
        "blocks": [],
        "artifacts": context.get("artifacts", []),
    }

    current_size = _estimate_size(truncated)

    for block in context.get("blocks", []):
        block_copy = block.copy()
        content = block_copy.get("content", "")

        remaining_space = max_chars - current_size
        if remaining_space <= 0:
            break

        if len(content) > remaining_space:
            block_copy["content"] = content[:remaining_space] + "...[truncated]"

        truncated["blocks"].append(block_copy)
        current_size = _estimate_size(truncated)

    return truncated


def _estimate_size(context: dict) -> int:
    """Estimate the character size of the context."""
    return len(json.dumps(context))
