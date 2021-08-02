<template>
<table>
  <tbody>
    <tr v-for="n in 10" v-bind:key="n">
      <td @click="cell_click" v-for="m in 10" v-bind:key="m">
      </td>
    </tr>
  </tbody>
</table>

</template>

<script>
export default {
  name: 'Grid',
  methods: {
      cell_click: function (event){
        event.target.classList.add("selected");
    }
  }
}
</script>
<style>
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
</style>
