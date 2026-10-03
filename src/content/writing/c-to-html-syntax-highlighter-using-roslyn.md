---
title: C# to Html Syntax Highlighter using Roslyn
description: Roslyn syntax trees and semantic information drive a C# to HTML highlighter,
  with a SyntaxWalker and explicit handling for type names whose definitions are unavailable.
datePublished: '2011-11-27'
dateModified: '2026-10-03'
tags:
- roslyn
- syntax-highlighting
- visitor-pattern
- design-patterns
- csharp
hero: c-to-html-syntax-highlighter-using-roslyn
draft: false
---

Ever since Roslyn was announced I’ve had a few ideas about what I’d want to do with Roslyn. Primarily there are two things I’d love to use Roslyn for:

1. Code generation – Generating code in such a way that I would have more semantic information about the existing code and thus be able to generate code in a “smarter” way.
2. C# to Html syntax highlighting – There are a few solutions out there but for one reason or another, I’m just not happy with them.

At the time of this writing the Roslyn project does not support attributes or partial methods. For my code generation ideas, I need support for both these C# language features. The syntax highlighting “project” is more a way for getting my feet wet with Roslyn, since I’ve never really worked with a parser/ lexical scanner/compiler.

Here is a ***live online demo version*** you can use to colorize your C# code:

[C# to Html Syntax Highlighter](https://web.archive.org/web/20240415164648/http://matlus.com/syntaxhighlighter)

In this post I’ll present a C# to Html syntax highlighter that I’ll publish online as a service so anyone can use it independent of an IDE. The primary point of focus (in terms of highlighting) in this project is the ability to highlight types that are unknown. This area is the biggest problem I have with other syntax highlighters.

The Roslyn Syntax APIs give you information about the syntactic structure of the code you provide it with. However, that’s not enough to do a good job of colorizing code the way we’d expect it to. The reason is that there are many cases in which names of types have no meaning unless the appropriate assemblies and namespaces are “in-scope” in order to glean more semantic information about the code. So for example, lets take a look at the snippet of code below.

### Sample snippet of code



```csharp
using System;using System.Collections.Generic;using System.Linq;using System.Text;namespace ConsoleApplication27{  class Program  {    static void Main(string[] args)    {      Customer customer = new Customer();    }  }}
```



  
### Code Listing 1: Sample Code

The line:



```text
Customer customer = new Customer();
```



Is syntactically legal C# code. However, without any semantic information about the rest of the code, the type <code>Customer</code> is unknown and as as result won’t get colored as an identifier (in teal) as we see above. In fact in VS the compiler will issue an error and put squiggles under the text <code>Customer</code>. The error would be: The type or namespace name 'Customer' could not be found (are you missing a using directive or an assembly reference?)

There are many such cases that present difficulties in proper colorizing when attempting to do this outside of the IDE, as we are since the project presented here is for online use or as a plug-in to other tools such as Windows Live Writer that won’t be able to provide the additional semantic information needed for this job.

### Bare minimum

The code presented here requires a certain bare minimum in order to syntax highlight correctly. Code needs to be in a method body at a minimum. So if you have a few lines of code without the rest of the method the code will not highlight correctly. This is intentional as I didn’t want to hardcode a bunch of C# keywords and a bunch of “well known” identifiers etc. I wanted to see how far I could take this method too much work and with no hard coded list of keywords or identifiers.

The single line above will get highlighted correctly. But that's the odd case. Snippets of code that include the entire method, or entire class get correctly highlighted (in all my tests so far).

When I initially started down this road I thought this would be a fairly simple matter because I found <code><code>SyntaxFacts</code></code> (as static class in the Roslyn.Compilers.CSharp namespace) that had methods such as:

- IsKeyword
- IsContextualKeyword
- IsTypeDecleration
- IsPredefinedType

So it would be a simple matter of iterating over all of the tokens in the syntax tree and processing each token differently. Instead of iterating over all of the tokens, we could Visit each token (Visitor Pattern).

As part of the Roslyn project we get a class called <code>SyntaxWalker</code> that descends an entire <code>SyntaxNode</code> graph visiting each <code>SyntaxNode</code> and its children nodes and <code>SyntaxTokens</code> in depth-first order. For our purposes this is perfect since the depth-first order will allow us to write out html as we’re walking the tree.

Thanks go out to [Shyam Namboodiripad](https://web.archive.org/web/20240415164648/http://social.msdn.microsoft.com/profile/shyam%20namboodiripad/?ws=usercard-mini) who is on the Roslyn team and without whose help this project would have take a heck of a lot longer and probably never have completed. So Thank you Shyam!

## C# to Html Syntax Highlighter

The way you would use the classes presented in this post is really very simple.



```text
var html = CSharpToHtmlSyntaxHighlighter.GetHtml("SomeCode"));
```



Where "SomeCode" is the entire code you want highlighted. What you get back is html that you can insert into a blog post or html page, etc. The html generated uses CSS classes to color code the generated Html. So you'll need the following styles declared in your stylesheet or page:



```text
  .Keyword { color: #0000ff; }
  .StringLiteral { color: #a31515; }
  .CharacterLiteral { color: #d202fe; }
  .Identifier { color: #2b91af; }
  .Comment { color: #008000; }
  .Region { color: #e0e0e0; }
```



## Introducing the CSharpToHtmlSyntaxHighlighter

This class is a static class and you'd use it like shown above. The code listing below shows the entire class.
### CSharpToHtmlSyntaxHighlighter.cs



```csharp
using System.Text;
using System.Web;
using Roslyn.Compilers;
using Roslyn.Compilers.CSharp;

namespace Matlus.SyntaxHighlighter
{
  public static class CSharpToHtmlSyntaxHighlighter
  {
    private static readonly AssemblyFileReference mscorlib = new AssemblyFileReference(typeof(object).Assembly.Location);

    private static SemanticModel GetSemanticModelForSyntaxTree(SyntaxTree syntaxTree)
    {      
      var compilation = Compilation.Create(
        outputName: "CSharpToHtmlSyntaxHighlighterCompilation",
        syntaxTrees: new[] { syntaxTree },
        references: new[] { mscorlib });

      return compilation.GetSemanticModel(syntaxTree);
    }

    public static string GetHtml(string snippetOfCode)
    {
      var syntaxTree = SyntaxTree.ParseCompilationUnit(snippetOfCode);
      var semanticModel = GetSemanticModelForSyntaxTree(syntaxTree);
      var htmlColorizerSyntaxWalker = new HtmlColorizerSyntaxWalker();

      var htmlBuilder = new StringBuilder();
      htmlColorizerSyntaxWalker.DoVisit(syntaxTree.Root, semanticModel, (tk, text) =>
        {
          switch (tk)
          {
            case TokenKind.None:
              htmlBuilder.Append(text);
              break;
            case TokenKind.Keyword:
            case TokenKind.Identifier:
            case TokenKind.StringLiteral:
            case TokenKind.CharacterLiteral:
            case TokenKind.Comment:
            case TokenKind.DisabledText:
            case TokenKind.Region:
              htmlBuilder.Append("<span class=\"" + tk.ToString() + "\">" + HttpUtility.HtmlEncode(text) + "</span>");
              break;
            default:
              break;
          }
        });
      return htmlBuilder.ToString();
    }
  }
}

```



### Code Listing 2: Showing the entire CSharpToHtmlSyntaxHighlighter class

Let's take a look at the GetHtml() static method. This is the method that kicks off the whole process.

- Given a snippet of code, we create a <code>SyntaxTree</code> using a helper method of the <code>SyntaxTree</code> class.
- Next, using the syntax tree we create a <code>SemanticModel</code> using the code in the <code>GetSemanticModelForSyntaxTree</code> method.
- And finally, we call the <code>DoVisit()</code> method of the <code>HtmlColorizerSyntaxWalker</code> class.

When we call the <code>DoVisit()</code> method we pass it an <code>Action</code> delegate that we implement as a lambda expression as shown above. Each time the <code>HtmlColorizerSyntaxWalker</code> class finds a token of "interest" while walking the tree it calls us back in this Action delegate (the lambda above) and it is in this method that we generate the html and colorize each of the tokens in the way we desire.

## Introducing the HtmlColorizerSyntaxWalker

The code listing below shows the entire HtmlColorizerSyntaxWalker class. The primary method in this class is the DoVisit() method. This method initiates the “Visit” process, providing the SyntaxWalker with the root of the syntax tree that we want it to walk along with a couple of other parameters.

### HtmlColorizerSyntaxWalker.cs



```csharp
using System;
using Roslyn.Compilers.CSharp;

namespace Matlus.SyntaxHighlighter
{
  internal class HtmlColorizerSyntaxWalker : SyntaxWalker
  {
    private SemanticModel semanticModel;
    private Action<TokenKind, string> writeDelegate;

    internal void DoVisit(SyntaxNode token, SemanticModel semanticModel, Action<TokenKind, string> writeDelegate)
    {
      this.semanticModel = semanticModel;
      this.writeDelegate = writeDelegate;
      Visit(token);
    }

    // Handle SyntaxTokens
    protected override void VisitToken(SyntaxToken token)
    {
      base.VisitLeadingTrivia(token);

      var isProcessed = false;
      if (token.IsKeyword())
      {
        writeDelegate(TokenKind.Keyword, token.GetText());
        isProcessed = true;
      }
      else
      {
        switch (token.Kind)
        {
          case SyntaxKind.StringLiteralToken:
            writeDelegate(TokenKind.StringLiteral, token.GetText());
            isProcessed = true;
            break;
          case SyntaxKind.CharacterLiteralToken:
            writeDelegate(TokenKind.CharacterLiteral, token.GetText());
            isProcessed = true;
            break;
          case SyntaxKind.IdentifierToken:
            if (token.Parent is SimpleNameSyntax)
            {
              // SimpleName is the base type of IdentifierNameSyntax, GenericNameSyntax etc.
              // This handles type names that appear in variable declarations etc.
              // e.g. "TypeName x = a + b;"
              var name = (SimpleNameSyntax)token.Parent;
              var semanticInfo = semanticModel.GetSemanticInfo(name);
              if (semanticInfo.Symbol != null && semanticInfo.Symbol.Kind != SymbolKind.ErrorType)
              {
                switch (semanticInfo.Symbol.Kind)
                {
                  case SymbolKind.NamedType:
                    writeDelegate(TokenKind.Identifier, token.GetText());
                    isProcessed = true;
                    break;
                  case SymbolKind.Namespace:
                  case SymbolKind.Parameter:
                  case SymbolKind.Local:
                  case SymbolKind.Field:
                  case SymbolKind.Property:
                    writeDelegate(TokenKind.None, token.GetText());
                    isProcessed = true;
                    break;
                  default:
                    break;
                }
              }
            }
            else if (token.Parent is TypeDeclarationSyntax)
            {
              // TypeDeclarationSyntax is the base type of ClassDeclarationSyntax etc.
              // This handles type names that appear in type declarations
              // e.g. "class TypeName { }"
              var name = (TypeDeclarationSyntax)token.Parent;
              var symbol = semanticModel.GetDeclaredSymbol(name);
              if (symbol != null && symbol.Kind != SymbolKind.ErrorType)
              {
                switch (symbol.Kind)
                {
                  case SymbolKind.NamedType:
                    writeDelegate(TokenKind.Identifier, token.GetText());
                    isProcessed = true;
                    break;
                }
              }
            }
            break;
        }
      }

      if (!isProcessed)
        HandleSpecialCaseIdentifiers(token);

      base.VisitTrailingTrivia(token);
    }

    private void HandleSpecialCaseIdentifiers(SyntaxToken token)
    {
      switch (token.Kind)
      {
        // Special cases that are not handled because there is no semantic context/model that can truely identify identifiers.
        case SyntaxKind.IdentifierToken:
          if ((token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.Parameter)
            || (token.Parent.Kind == SyntaxKind.EnumDeclaration)
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.Attribute)
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.CatchDeclaration)
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.ObjectCreationExpression)
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.ForEachStatement && !(token.GetNextToken().Kind == SyntaxKind.CloseParenToken))
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Parent.Kind == SyntaxKind.CaseSwitchLabel && !(token.GetPreviousToken().Kind == SyntaxKind.DotToken))
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.MethodDeclaration)
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.CastExpression)
            //e.g. "private static readonly HashSet patternHashSet = new HashSet();" the first HashSet in this case
            || (token.Parent.Kind == SyntaxKind.GenericName && token.Parent.Parent.Kind == SyntaxKind.VariableDeclaration)
            //e.g. "private static readonly HashSet patternHashSet = new HashSet();" the second HashSet in this case
            || (token.Parent.Kind == SyntaxKind.GenericName && token.Parent.Parent.Kind == SyntaxKind.ObjectCreationExpression)
            //e.g. "public sealed class BuilderRouteHandler : IRouteHandler" IRouteHandler in this case
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.BaseList)
            //e.g. "Type baseBuilderType = typeof(BaseBuilder);" BaseBuilder in this case
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Parent.Parent.Kind == SyntaxKind.TypeOfExpression)
            // e.g. "private DbProviderFactory dbProviderFactory;" OR "DbConnection connection = dbProviderFactory.CreateConnection();"
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.VariableDeclaration)
            // e.g. "DbTypes = new Dictionary();" DbType in this case
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.TypeArgumentList)
            // e.g. "DbTypes.Add("int", DbType.Int32);" DbType in this case
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.MemberAccessExpression && token.Parent.Parent.Parent.Kind == SyntaxKind.Argument && !(token.GetPreviousToken().Kind == SyntaxKind.DotToken || Char.IsLower(token.GetText()[0])))
            // e.g. "schemaCommand.CommandType = CommandType.Text;" CommandType in this case
            || (token.Parent.Kind == SyntaxKind.IdentifierName && token.Parent.Parent.Kind == SyntaxKind.MemberAccessExpression && !(token.GetPreviousToken().Kind == SyntaxKind.DotToken || Char.IsLower(token.GetText()[0])))
            )
          {
            writeDelegate(TokenKind.Identifier, token.GetText());
          }
          else
          {
            if (token.GetText() == "HashSet")
            {
            }
            writeDelegate(TokenKind.None, token.GetText());
          }
          break;
        default:
          writeDelegate(TokenKind.None, token.GetText());
          break;
      }
    }

    // Handle SyntaxTrivia
    protected override void VisitTrivia(SyntaxTrivia trivia)
    {
      switch (trivia.Kind)
      {
        case SyntaxKind.MultiLineCommentTrivia:
        case SyntaxKind.SingleLineCommentTrivia:
          writeDelegate(TokenKind.Comment, trivia.GetText());
          break;
        case SyntaxKind.DisabledTextTrivia:
          writeDelegate(TokenKind.DisabledText, trivia.GetText());
          break;
        case SyntaxKind.DocumentationComment:
          writeDelegate(TokenKind.Comment, trivia.GetText());
          break;
        case SyntaxKind.RegionDirective:
        case SyntaxKind.EndRegionDirective:
          writeDelegate(TokenKind.Region, trivia.GetText());
          break;
        default:
          writeDelegate(TokenKind.None, trivia.GetText());
          break;
      }
      base.VisitTrivia(trivia);
    }
  }
}
```



### Code Listing 3: Showing the entire HtmlColorizerSyntaxWalker class

The 3rd parameter to the <code>DoVisit()</code> method is an <code>Action</code> delegate or a callback that gets called each time the SyntaxWalker has determined that the token it is currently on is one we would be ***interested*** in. When it calls us back on this delegate it also lets us know the kind of token is has found using the <code>TokenKind</code> enum. The <code>TokenKind</code> enum is not a built in type. I couldn’t find a suitable type so I had to define one that worked best for this purpose (syntax highlighting). The definition of this enum is shown below:

### TokenKind.cs



```csharp
namespace Matlus.SyntaxHighlighter
{
  internal enum TokenKind
  {
    None,
    Keyword,
    Identifier,
    StringLiteral,
    CharacterLiteral,
    Comment,
    DisabledText,
    Region    
  }
}
```



### Code Listing 4: Showing the TokenKind enum

The rest of the code looks quite complicated but really isn't. It is basically a bunch of conditional statements.

The method that handles all of the (special) cases where \*we\* know the token is an identifier but Roslyn can't (because it lacks semantic information) is, <code>HandleSpecialCaseIdentifiers</code>. If you come across any token that falls through the cracks, you’ll need to add a conditional statement here to handle that case.
