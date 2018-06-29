#!/usr/bin/env python
from lxml import etree
import lxml.html
import pprint
import re
import cssselect
from IPython.display import display, HTML
# вручную надо удалить всё после «Географические синонимы»
# придумать, как делать дрилл-даун до исходных данных
from parglare import Parser, Grammar

grammar = r"""
Tokens: Token? Tokens? EOF;
Token: LayerPrefix Layer {3}
     | Layer {2}
     | Skip {1} 
     | LayerPrefix {1};
Layer: Mel_fixme
     | Paleocene
     | Eocene 
     | Oligocene 
     | Miocene 
     | Pliocene 
     | Pleistocene 
     | Holocene
     ;
LayerPrefix: Upper 
     | Middle 
     | Lower;

terminals
Mel_fixme: "Мел";
Paleocene: "Палеоцен";
Eocene: "Эоцен";
Oligocene: "Олигоцен";
Miocene: "Миоцен";
Pliocene: "Плиоцен";
Pleistocene: "Плейстоцен";
Holocene: "Голоцен";

Upper: "в.";
Middle: "ср.";
Lower: "н.";

Skip: /./;
"""

actions = {
    "Tokens":[lambda _, nodes: nodes[0] if nodes[0] else nodes[1]], # предпочитаем первый
    "Token": [lambda _, nodes: nodes[1],
              lambda _, nodes: nodes[0],
              lambda _, value: [],
              lambda _, value: []],
    "Layer": [lambda _, value: [145.0, 66.0],
              lambda _, value: [ 66.0,  56.0],
              lambda _, value: [ 56.0,  33.9],
              lambda _, value: [ 33.9,  23.03],
              lambda _, value: [ 23.03,  5.333],
              lambda _, value: [ 5.333,  1.806],
              lambda _, value: [ 1.806,  0.0117],
              lambda _, value: [ 0.0117, 0.0]],
    "LayerPrefix": [lambda _, value: [],
              lambda _, value: [],
              lambda _, value: []]
}

g = Grammar.from_string(grammar, ignore_case=True)
#parser = Parser(g, debug=False, debug_trace=True)
parser = Parser(g, debug=False, debug_trace=False, actions=actions)


tree = lxml.html.parse("Primat_s.html").getroot()

for e in tree.cssselect("span, ul, ol, li, a, font"):
    e.drop_tag()

tree.get_element_by_id("Table of Contents1").drop_tree()


for e in tree.cssselect("p, h1, h2, h3, h4, h5, h6, table>tr>td:nth-child(2)"):
    line = e.text_content()
    line = re.sub(r"\n", r"", line)
    line = re.sub(r"\t", r" ", line)
    if e.tag == "td" and len(e.getparent())==3: # trying to grab the age
        #pprint.pprint()
        line = re.sub(r"\(.*\)", r"", line)
        line = re.sub(r"(\d),(\d)", r"\1.\2", line) # changing digit separator: 0,1 to 0.1
        print(parser.parse(line))
        #for part in re.split(';|,',line):
        #    if re.search(r'\bмел\b|цен\b|\bмлн\b|\bсовр\b', part, flags=re.IGNORECASE):
        #        print(part)
    else: # if it's p, h1 and so on
        #print(type(line))
        #pprint.pprint(e.text_content())
        match = re.sub(r"^\s*(надотряд\b.*)",       r"* \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:отряд\b).*)",      r"* * \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:подотряд\b).*)",   r"* * *  \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:гипотряд\b).*)", r"* * * *  \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:инфраотряд\b).*)",  r"* * * * *  \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:парвотряд\b).*)",   r"* * * * * *  \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:надсем\b).*)",     r"* * * * * * *  \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:сем\b\.).*)",        r"* * * * * * * *  \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:подсем\b\.).*)",     r"* * * * * * * * *  \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)
        match = re.sub(r"^\s*((?:триба).*)",      r"* * * * * * * * * *  \1", line, flags=re.IGNORECASE)
        if match!=line:
            print(match)


#for e in tree.cssselect("table>tr"):
#    if(len(e)==3):
#        pass
        #e[0].text = "111"

#display(HTML(str(lxml.html.tostring(tree)))) работает, но выводить в ХТМЛ кучу \n\t
        
#out = open('out.html', 'wb')
#result = lxml.html.tostring(tree, pretty_print=True, method="html")
#out.write(result)
