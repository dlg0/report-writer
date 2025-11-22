from typing import List, Dict, Any
import difflib
import re


def compute_block_diff(old_text: str, new_text: str) -> Dict[str, Any]:
    """
    Compute word-level diff between old and new text.
    
    Returns:
    {
        "old_text": str,
        "new_text": str,
        "operations": [
            {"type": "add|delete|keep", "text": str, "position": int}
        ]
    }
    
    Preserves markdown structure (headings, lists, code blocks).
    """
    old_tokens = _tokenize_markdown(old_text)
    new_tokens = _tokenize_markdown(new_text)
    
    matcher = difflib.SequenceMatcher(None, old_tokens, new_tokens)
    operations = []
    position = 0
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            for token in old_tokens[i1:i2]:
                operations.append({
                    "type": "keep",
                    "text": token,
                    "position": position
                })
                position += 1
        elif tag == 'delete':
            for token in old_tokens[i1:i2]:
                operations.append({
                    "type": "delete",
                    "text": token,
                    "position": position
                })
                position += 1
        elif tag == 'insert':
            for token in new_tokens[j1:j2]:
                operations.append({
                    "type": "add",
                    "text": token,
                    "position": position
                })
                position += 1
        elif tag == 'replace':
            for token in old_tokens[i1:i2]:
                operations.append({
                    "type": "delete",
                    "text": token,
                    "position": position
                })
                position += 1
            for token in new_tokens[j1:j2]:
                operations.append({
                    "type": "add",
                    "text": token,
                    "position": position
                })
                position += 1
    
    return {
        "old_text": old_text,
        "new_text": new_text,
        "operations": operations
    }


def apply_diff(original_blocks: List[Dict], proposed_edits: List[Dict]) -> List[Dict]:
    """
    Apply proposed edits to original blocks.
    
    Args:
        original_blocks: List of block dicts {blockId, markdownText, ...}
        proposed_edits: List of {blockId, newMarkdownText}
    
    Returns:
        Updated blocks list
    
    Validates that blockIds exist before applying.
    """
    blocks_map = {block["blockId"]: block for block in original_blocks}
    
    for edit in proposed_edits:
        block_id = edit.get("blockId")
        if block_id not in blocks_map:
            raise ValueError(f"Block ID '{block_id}' not found in original blocks")
        
        blocks_map[block_id]["markdownText"] = edit["newMarkdownText"]
    
    return [blocks_map[block["blockId"]] for block in original_blocks]


def format_diff_for_display(diff: Dict) -> str:
    """
    Format diff for human-readable display.
    
    Uses markers:
    - [+added text+]
    - [-deleted text-]
    
    Returns formatted string.
    """
    result = []
    
    for op in diff["operations"]:
        if op["type"] == "keep":
            result.append(op["text"])
        elif op["type"] == "add":
            result.append(f"[+{op['text']}+]")
        elif op["type"] == "delete":
            result.append(f"[-{op['text']}-]")
    
    return "".join(result)


def _tokenize_markdown(text: str) -> List[str]:
    """
    Tokenize markdown text preserving structure.
    
    Splits on word boundaries but keeps markdown tokens intact:
    - Headings (#, ##, ###, etc.)
    - List markers (-, *, 1., etc.)
    - Code blocks (```, ```)
    - Inline code (`code`)
    - Links, emphasis, etc.
    """
    if not text:
        return []
    
    tokens = []
    pattern = r'(\s+|```|`|#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|\[.*?\]\(.*?\)|\*\*|__|\*|_|~~)'
    
    parts = re.split(pattern, text, flags=re.MULTILINE)
    
    for part in parts:
        if part:
            tokens.append(part)
    
    return tokens
