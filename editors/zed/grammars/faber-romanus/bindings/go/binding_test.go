package tree_sitter_faber_romanus_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-faber_romanus"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_faber_romanus.Language())
	if language == nil {
		t.Errorf("Error loading FaberRomanus grammar")
	}
}
