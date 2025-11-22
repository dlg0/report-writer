import pytest
import json
from sandbox.test_doubles.fake_llm import FakeLLM


@pytest.mark.asyncio
async def test_fake_llm_default_response():
    llm = FakeLLM()
    response = await llm.complete([{"role": "user", "content": "Hello"}])
    data = json.loads(response)
    
    assert "message" in data
    assert "proposedEdits" in data
    assert isinstance(data["proposedEdits"], list)


@pytest.mark.asyncio
async def test_fake_llm_rewrite_response():
    llm = FakeLLM()
    response = await llm.complete([{"role": "user", "content": "Rewrite this section"}])
    data = json.loads(response)
    
    assert data["proposedEdits"][0]["action"] == "update"
    assert data["proposedEdits"][0]["type"] == "block"


@pytest.mark.asyncio
async def test_fake_llm_create_response():
    llm = FakeLLM()
    response = await llm.complete([{"role": "user", "content": "Add a new section"}])
    data = json.loads(response)
    
    assert data["proposedEdits"][0]["action"] == "create"
    assert data["proposedEdits"][0]["type"] == "section"


@pytest.mark.asyncio
async def test_fake_llm_delete_response():
    llm = FakeLLM()
    response = await llm.complete([{"role": "user", "content": "Delete this block"}])
    data = json.loads(response)
    
    assert data["proposedEdits"][0]["action"] == "delete"


@pytest.mark.asyncio
async def test_fake_llm_custom_response_map():
    custom_response = {
        "message": "Custom response",
        "proposedEdits": [{"type": "block", "id": "custom", "action": "update", "content": "Custom"}]
    }
    llm = FakeLLM(response_map={"special": custom_response})
    
    response = await llm.complete([{"role": "user", "content": "This is a special request"}])
    data = json.loads(response)
    
    assert data["message"] == "Custom response"
    assert data["proposedEdits"][0]["id"] == "custom"


@pytest.mark.asyncio
async def test_fake_llm_tracks_calls():
    llm = FakeLLM()
    
    assert llm.call_count == 0
    assert llm.last_messages is None
    
    messages = [{"role": "user", "content": "Test"}]
    await llm.complete(messages)
    
    assert llm.call_count == 1
    assert llm.last_messages == messages


@pytest.mark.asyncio
async def test_fake_llm_reset():
    llm = FakeLLM()
    
    await llm.complete([{"role": "user", "content": "Test"}])
    assert llm.call_count == 1
    
    llm.reset()
    assert llm.call_count == 0
    assert llm.last_messages is None
