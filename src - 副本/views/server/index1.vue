<!-- index.vue -->
<template>
  <div>
    <div v-for="(chardata,index) in msg" :key="index" class="test">
      <echartscom :chartData="chardata" autoresize />
    </div>
  </div>
</template>
 
<script>
  import echartscom from '@/components/MyEcharts/index.vue'
  export default {
    data() {
      return {
        msg:{
          chartData1: [
              {value:335, name:'直接访问'},
              {value:310, name:'邮件营销'},
              {value:234, name:'联盟广告'},
              {value:135, name:'视频广告'},
              {value:1548, name:'搜索引擎'}
          ],
          chartData2: [
              {value:335, name:'直接访问'},
              {value:310, name:'邮件营销'},
              {value:234, name:'联盟广告'},
              {value:135, name:'视频广告'},
              {value:1548, name:'搜索引擎'}
          ],
        }
      };
    },
    methods: {
    },
    mounted() {},
    components: {
      echartscom
    }
  };
</script>
 
<style>
  .test{
    float: left;
  }
</style>