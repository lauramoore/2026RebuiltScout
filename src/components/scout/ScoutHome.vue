<template>
  <h1>Match Schedule</h1>
  <table>
    <thead>
    <tr>
      <th>Match#</th>
      <th>Red 1</th>
      <th>Red 2</th>
      <th>Red 3</th>
      <th>Blue 1</th>
      <th>Blue 2</th>
      <th>Blue 3</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="match in matches" :key="match.matchNumber">
      <td>{{ match.matchNumber }}</td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.red1 } }">{{ match.red1 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.red2 } }">{{ match.red2 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.red3 } }">{{ match.red3 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.blue1 } }">{{ match.blue1 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.blue2 } }">{{ match.blue2 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.blue3 } }">{{ match.blue3 }}</router-link></td>
    </tr>
  </tbody>
  </table>
</template>
<script>
export default {
  data() {
    return {
      matches: [
        { matchNumber: 1, red1: 2974, red2: 1771, red3: 6982, blue1: 734, blue2: 101, blue3: 7325 }
      ]
    }
  }
};
</script>
