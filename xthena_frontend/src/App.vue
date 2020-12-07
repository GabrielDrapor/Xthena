<template>
<div id="option">
<button @click="init">Init</button>
<button @click="showAnswer">Show Answer</button>
</div>
<table>
  <tbody>
    <tr v-for="n in 10" v-bind:key="n">
      <td @click="cell_click" v-for="m in 10" v-bind:key="m">
      </td>
    </tr>
  </tbody>
</table>
<div class="hint">提示文本</div>
</template>

<script>
import { maps } from './mock_data.js'

function get_term_by_coor(x, y) {
  var i = 0;
  var j = 0;
  var rs = [];
  for (i = 0; i < maps.length; i++) {
    for (j = 0; j < maps[i]["chrs"].length; j++) {
      var coor = maps[i]["chrs"][j]["coor"];
      if (coor[0] == x && coor[1] == y) {
        rs.push(maps[i]);
      }
    }
  }
  return rs;
}

function get_td_by_coor(x, y) {
  return document.getElementsByTagName("tr")[x].getElementsByTagName("td")[y];
}

export default {
  name: 'App',
  components: {},
  methods: {
    cell_click: function (event){
      var node = event.target;
      var x = node.parentNode.rowIndex;
      var y = node.cellIndex;
      var terms = get_term_by_coor(x, y);
      if (node.id != "veil" && !node.classList.contains("selected")) {
        document.getElementsByClassName("hint")[0].innerText = terms[0].hint;
        var selected = document.getElementsByClassName("selected");
        selected = Array.from(selected);
        var s;
        for (s of selected) {
          s.classList = [];
        }
        for (s of terms[0].chrs) {
          var coor = s["coor"];
          get_td_by_coor(coor[0], coor[1]).classList.add("selected");
        }
      } else if (node.classList.contains("selected")) {
        if (terms.length == 2) {
          var current_text = document.getElementsByClassName("hint")[0].innerText
          var term;
          for (term of terms) {
            if (term.hint != current_text) {
              document.getElementsByClassName("hint")[0].innerText = term.hint;
              selected = document.getElementsByClassName("selected");
              selected = Array.from(selected);
              for (s of selected) {
                s.classList = [];
              }
              for (s of term.chrs) {
                coor = s["coor"];
                get_td_by_coor(coor[0], coor[1]).classList.add("selected");
              }
            }
          }
        }
      }
    },
    showAnswer: function (){
      var i = 0;
      var j = 0;
      for (i = 0; i < maps.length; i++) {
        for (j = 0; j < maps[i]["chrs"].length; j++) {
          var coor = maps[i]["chrs"][j]["coor"];
          var val = maps[i]["chrs"][j]["val"];
          document.getElementsByTagName("tr")[coor[0]].getElementsByTagName("td")[coor[1]].innerText = val;
        }
      }
    },
    init: function (){
      var tds = document.getElementsByTagName("td")
      var i = 0;
      var j = 0;
      for (i = 0; i < tds.length; i++) {
        tds[i].id = "veil";
        tds[i].innerText = "";
      }
      for (i = 0; i < maps.length; i++) {
        for (j = 0; j < maps[i]["chrs"].length; j++) {
          var coor = maps[i]["chrs"][j]["coor"];
          document.getElementsByTagName("tr")[coor[0]].getElementsByTagName("td")[coor[1]].id = "";
          document.getElementsByTagName("tr")[coor[0]].getElementsByTagName("td")[coor[1]].classList = [];
        }
      }

    }
  },
  mounted: function() {
    this.init()
  }
}
</script>

<style>
#veil {
    background-color: #888888;
}
td {
  width: 55px;
  height: 55px;
  border-collapse: collapse;
  text-align: center;
}

tr td {
  border: 2px solid black;
  font-size: 30px;
}

table {
  border-collapse: collapse
}

td.selected {
    background: #8b8bffb5;
}

.hint {
    position: fixed;
    left: 600px;
    top: 30px;
    writing-mode: vertical-lr;
    font-size: 30px;
    text-orientation: upright;
    height: 600px;
}
</style>
