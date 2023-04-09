{
  let entities = {};
}

Start
  = Vocabulary*

Vocabulary
  = type:"Vocabulary"_cc text:Text _
  { return { type, text, location: location() } }
  / Entity

Entity
  = type:"Term"_cc name:Text _ "Concept Type"+_cc ctype:Text _ {
      entities[name] = ctype;
      { return { type, text: name, location: location() } }
    }
  / FactType _ Synonymous_Form* _ Necessity*
  / Rule

Term "term declaration"
  = "Term"_cc entity:Identifier _ conceptType:ConceptType _ { return {entity, type: conceptType, location: location()}; }

ConceptType "concept type declaration"
  = "Concept Type"_cc type:Type _ { return type; }

Type "type"
  = "Text (Type)" { return "text"; }

FactType
  = type:"Fact Type"_cc text:Text EOL
  { return { type, text, location: location() } }

Synonymous_Form
  = _ type:"Synonymous Form"_cc text:Text EOL
  { return { type, text, location: location() } }

Necessity
  = type:"Necessity"_cc text:Text EOL
  { return { type, text, location: location() } }

Rule
  = type:"Rule"_cc text:Text _
  { return { type, text, location: location() } }

// Roots
Text "text till the end of line"
  = result:[^\n]+ { return result.join('') }
Identifier "identifier"
  = [a-zA-Z]+ { return text(); }
Line = words:Word+ _ EOL { return words.join(' '); }
Word "word" = [a-zA-Z]+
_ "whitespaces all" = [ \t\n\r]*
_s "space" = [ \t]*
_cc "': '" = ': '
EOL "end of line" = '\r'? '\n'
