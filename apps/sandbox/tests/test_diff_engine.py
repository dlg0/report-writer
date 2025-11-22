import pytest
from sandbox.core.diff_engine import (
    compute_block_diff,
    apply_diff,
    format_diff_for_display
)


class TestComputeBlockDiff:
    def test_basic_word_diff_add(self):
        old_text = "Hello world"
        new_text = "Hello beautiful world"
        
        diff = compute_block_diff(old_text, new_text)
        
        assert diff["old_text"] == old_text
        assert diff["new_text"] == new_text
        assert any(op["type"] == "add" and "beautiful" in op["text"] for op in diff["operations"])
    
    def test_basic_word_diff_delete(self):
        old_text = "Hello beautiful world"
        new_text = "Hello world"
        
        diff = compute_block_diff(old_text, new_text)
        
        assert any(op["type"] == "delete" and "beautiful" in op["text"] for op in diff["operations"])
    
    def test_basic_word_diff_replace(self):
        old_text = "Hello world"
        new_text = "Hello universe"
        
        diff = compute_block_diff(old_text, new_text)
        
        assert any(op["type"] == "delete" and "world" in op["text"] for op in diff["operations"])
        assert any(op["type"] == "add" and "universe" in op["text"] for op in diff["operations"])
    
    def test_empty_blocks(self):
        diff = compute_block_diff("", "")
        assert diff["operations"] == []
        
        diff = compute_block_diff("", "New text")
        assert all(op["type"] == "add" for op in diff["operations"])
        
        diff = compute_block_diff("Old text", "")
        assert all(op["type"] == "delete" for op in diff["operations"])
    
    def test_markdown_heading_preservation(self):
        old_text = "# Old Heading"
        new_text = "# New Heading"
        
        diff = compute_block_diff(old_text, new_text)
        
        assert any("#" in op["text"] for op in diff["operations"])
        assert any(op["type"] == "delete" and "Old" in op["text"] for op in diff["operations"])
        assert any(op["type"] == "add" and "New" in op["text"] for op in diff["operations"])
    
    def test_markdown_list_preservation(self):
        old_text = "- Item one\n- Item two"
        new_text = "- Item one\n- Item three"
        
        diff = compute_block_diff(old_text, new_text)
        
        assert any(op["type"] == "delete" and "two" in op["text"] for op in diff["operations"])
        assert any(op["type"] == "add" and "three" in op["text"] for op in diff["operations"])
    
    def test_markdown_code_blocks(self):
        old_text = "```python\nold_code\n```"
        new_text = "```python\nnew_code\n```"
        
        diff = compute_block_diff(old_text, new_text)
        
        assert any("```" in op["text"] for op in diff["operations"])
        assert any(op["type"] == "delete" and "old" in op["text"] for op in diff["operations"])
        assert any(op["type"] == "add" and "new" in op["text"] for op in diff["operations"])
    
    def test_special_characters(self):
        old_text = "Hello @user! How's it going?"
        new_text = "Hello @admin! How's it going?"
        
        diff = compute_block_diff(old_text, new_text)
        
        assert any(op["type"] == "delete" and "@user" in op["text"] for op in diff["operations"])
        assert any(op["type"] == "add" and "@admin" in op["text"] for op in diff["operations"])
    
    def test_no_changes(self):
        text = "Identical text"
        diff = compute_block_diff(text, text)
        
        assert all(op["type"] == "keep" for op in diff["operations"])


class TestApplyDiff:
    def test_apply_single_edit(self):
        original_blocks = [
            {"blockId": "block1", "markdownText": "Old text"},
            {"blockId": "block2", "markdownText": "Keep this"}
        ]
        proposed_edits = [
            {"blockId": "block1", "newMarkdownText": "New text"}
        ]
        
        result = apply_diff(original_blocks, proposed_edits)
        
        assert result[0]["markdownText"] == "New text"
        assert result[1]["markdownText"] == "Keep this"
    
    def test_apply_multiple_edits(self):
        original_blocks = [
            {"blockId": "block1", "markdownText": "Text 1"},
            {"blockId": "block2", "markdownText": "Text 2"},
            {"blockId": "block3", "markdownText": "Text 3"}
        ]
        proposed_edits = [
            {"blockId": "block1", "newMarkdownText": "Updated 1"},
            {"blockId": "block3", "newMarkdownText": "Updated 3"}
        ]
        
        result = apply_diff(original_blocks, proposed_edits)
        
        assert result[0]["markdownText"] == "Updated 1"
        assert result[1]["markdownText"] == "Text 2"
        assert result[2]["markdownText"] == "Updated 3"
    
    def test_invalid_block_id_raises_error(self):
        original_blocks = [
            {"blockId": "block1", "markdownText": "Text 1"}
        ]
        proposed_edits = [
            {"blockId": "nonexistent", "newMarkdownText": "New text"}
        ]
        
        with pytest.raises(ValueError, match="Block ID 'nonexistent' not found"):
            apply_diff(original_blocks, proposed_edits)
    
    def test_empty_edits(self):
        original_blocks = [
            {"blockId": "block1", "markdownText": "Text 1"}
        ]
        proposed_edits = []
        
        result = apply_diff(original_blocks, proposed_edits)
        
        assert result == original_blocks
    
    def test_preserves_order(self):
        original_blocks = [
            {"blockId": "block3", "markdownText": "Third"},
            {"blockId": "block1", "markdownText": "First"},
            {"blockId": "block2", "markdownText": "Second"}
        ]
        proposed_edits = [
            {"blockId": "block1", "newMarkdownText": "Updated First"}
        ]
        
        result = apply_diff(original_blocks, proposed_edits)
        
        assert result[0]["blockId"] == "block3"
        assert result[1]["blockId"] == "block1"
        assert result[2]["blockId"] == "block2"
        assert result[1]["markdownText"] == "Updated First"
    
    def test_preserves_additional_properties(self):
        original_blocks = [
            {"blockId": "block1", "markdownText": "Text", "metadata": {"author": "Alice"}}
        ]
        proposed_edits = [
            {"blockId": "block1", "newMarkdownText": "Updated"}
        ]
        
        result = apply_diff(original_blocks, proposed_edits)
        
        assert result[0]["metadata"] == {"author": "Alice"}


class TestFormatDiffForDisplay:
    def test_format_additions(self):
        diff = {
            "old_text": "Hello world",
            "new_text": "Hello beautiful world",
            "operations": [
                {"type": "keep", "text": "Hello", "position": 0},
                {"type": "keep", "text": " ", "position": 1},
                {"type": "add", "text": "beautiful", "position": 2},
                {"type": "add", "text": " ", "position": 3},
                {"type": "keep", "text": "world", "position": 4}
            ]
        }
        
        result = format_diff_for_display(diff)
        
        assert result == "Hello [+beautiful+][+ +]world"
    
    def test_format_deletions(self):
        diff = {
            "old_text": "Hello beautiful world",
            "new_text": "Hello world",
            "operations": [
                {"type": "keep", "text": "Hello", "position": 0},
                {"type": "keep", "text": " ", "position": 1},
                {"type": "delete", "text": "beautiful", "position": 2},
                {"type": "delete", "text": " ", "position": 3},
                {"type": "keep", "text": "world", "position": 4}
            ]
        }
        
        result = format_diff_for_display(diff)
        
        assert result == "Hello [-beautiful-][- -]world"
    
    def test_format_mixed_changes(self):
        diff = {
            "old_text": "Hello world",
            "new_text": "Hello universe",
            "operations": [
                {"type": "keep", "text": "Hello", "position": 0},
                {"type": "keep", "text": " ", "position": 1},
                {"type": "delete", "text": "world", "position": 2},
                {"type": "add", "text": "universe", "position": 3}
            ]
        }
        
        result = format_diff_for_display(diff)
        
        assert result == "Hello [-world-][+universe+]"
    
    def test_format_no_changes(self):
        diff = {
            "old_text": "Same text",
            "new_text": "Same text",
            "operations": [
                {"type": "keep", "text": "Same", "position": 0},
                {"type": "keep", "text": " ", "position": 1},
                {"type": "keep", "text": "text", "position": 2}
            ]
        }
        
        result = format_diff_for_display(diff)
        
        assert result == "Same text"
    
    def test_format_empty_diff(self):
        diff = {
            "old_text": "",
            "new_text": "",
            "operations": []
        }
        
        result = format_diff_for_display(diff)
        
        assert result == ""
