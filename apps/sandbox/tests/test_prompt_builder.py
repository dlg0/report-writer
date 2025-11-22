import pytest
from sandbox.core.prompt_builder import (
    build_agent_prompt,
    truncate_context,
    _build_context_prompt,
)


def test_build_agent_prompt_basic():
    thread_messages = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"},
    ]
    context = {}
    
    messages = build_agent_prompt(thread_messages, context)
    
    assert len(messages) >= 2
    assert messages[0]["role"] == "system"
    assert "AI assistant" in messages[0]["content"]
    assert messages[-2]["role"] == "user"
    assert messages[-2]["content"] == "Hello"
    assert messages[-1]["role"] == "assistant"
    assert messages[-1]["content"] == "Hi there!"


def test_build_agent_prompt_with_context():
    thread_messages = [{"role": "user", "content": "Rewrite intro"}]
    context = {
        "sections": [{"id": "intro", "title": "Introduction"}],
        "blocks": [
            {"id": "block-1", "type": "text", "content": "This is the introduction."}
        ],
    }
    
    messages = build_agent_prompt(thread_messages, context)
    
    context_message = next(
        (m for m in messages if m["role"] == "system" and "Current report context" in m["content"]),
        None
    )
    assert context_message is not None
    assert "intro" in context_message["content"]
    assert "block-1" in context_message["content"]


def test_build_agent_prompt_filters_empty_messages():
    thread_messages = [
        {"role": "user", "content": "Hello"},
        {"role": "user", "content": ""},
        {"role": "assistant", "content": "Response"},
    ]
    context = {}
    
    messages = build_agent_prompt(thread_messages, context)
    
    non_system_messages = [m for m in messages if m["role"] != "system"]
    assert len(non_system_messages) == 2
    assert all(m["content"] != "" for m in non_system_messages)


def test_build_context_prompt_empty():
    result = _build_context_prompt({})
    assert result == ""


def test_build_context_prompt_with_sections():
    context = {
        "sections": [
            {"id": "sec-1", "title": "Introduction"},
            {"id": "sec-2", "title": "Methods"},
        ]
    }
    
    result = _build_context_prompt(context)
    
    assert "Current report context" in result
    assert "sec-1" in result
    assert "Introduction" in result
    assert "sec-2" in result
    assert "Methods" in result


def test_build_context_prompt_with_blocks():
    context = {
        "blocks": [
            {"id": "block-1", "type": "text", "content": "Short content"},
            {"id": "block-2", "type": "text", "content": "A" * 300},
        ]
    }
    
    result = _build_context_prompt(context)
    
    assert "block-1" in result
    assert "Short content" in result
    assert "block-2" in result
    assert "..." in result


def test_build_context_prompt_with_artifacts():
    context = {
        "artifacts": [
            {"id": "art-1", "name": "Figure 1"},
            {"id": "art-2", "name": "Table 1"},
        ]
    }
    
    result = _build_context_prompt(context)
    
    assert "art-1" in result
    assert "Figure 1" in result


def test_truncate_context_no_truncation_needed():
    context = {
        "sections": [{"id": "sec-1", "title": "Intro"}],
        "blocks": [{"id": "block-1", "content": "Short content"}],
        "artifacts": [],
    }
    
    result = truncate_context(context, max_tokens=10000)
    
    assert result["sections"] == context["sections"]
    assert result["blocks"] == context["blocks"]


def test_truncate_context_truncates_large_content():
    large_content = "A" * 50000
    context = {
        "sections": [],
        "blocks": [{"id": "block-1", "content": large_content}],
        "artifacts": [],
    }
    
    result = truncate_context(context, max_tokens=1000)
    
    assert len(result["blocks"]) > 0
    truncated_content = result["blocks"][0]["content"]
    assert len(truncated_content) < len(large_content)
    assert "[truncated]" in truncated_content


def test_truncate_context_stops_when_limit_reached():
    context = {
        "sections": [],
        "blocks": [
            {"id": f"block-{i}", "content": "A" * 5000} for i in range(10)
        ],
        "artifacts": [],
    }
    
    result = truncate_context(context, max_tokens=2000)
    
    assert len(result["blocks"]) < len(context["blocks"])
