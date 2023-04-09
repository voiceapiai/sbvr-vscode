{
  let entities = {};
}

Start
  = Entity*

Entity
  = label:"Term"_cc name:Text _ "Concept Type"+_cc type:Text _ {
      entities[name] = type;
      { return { label, text: name, location: location() } }
    }
  / FactType
  / Synonymous_Form
  / Rule

TermDecl "term declaration"
  = "Term"_cc entity:Identifier _ conceptType:ConceptType _ { return {entity, type: conceptType, location: location()}; }

ConceptType "concept type declaration"
  = "Concept Type"_cc type:Type _ { return type; }

Type "type"
  = "Text (Type)" { return "text"; }

FactType
  = label:"Fact Type"_cc text:Text EOL
  { return { label,text, location: location() } }

Synonymous_Form
  = _ label:"Synonymous Form"_cc text:Text EOL
  { return { label, text, location: location() } }

Rule
  = label:"Rule"_cc text:Text EOL
  { return { label, text, location: location() } }

// Roots
Text "text till the end of line"
  = result:[^\n]+ { return result.join('') }
Identifier "identifier"
  = [a-zA-Z]+ { return text(); }
Line = words:Word+ _ EOL { return words.join(' '); }
Word "word" = [a-zA-Z]+
_ "whitespaces all" = [ \t\n\r]*
_s "space" = [ \t]*
_cc "column space separator" = ': '
EOL "end of line" = '\r'? '\n'
