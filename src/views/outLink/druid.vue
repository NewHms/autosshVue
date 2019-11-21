<script>
  import {mapGetters} from 'vuex'
  export default {
    data() {
      return {
      }
    
    },
    created() {
     //打开弹窗 
     window.open('http://192.168.208.136:1234/druid/sql.html')
     this.$router.push({name: '首页'})  
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
    
    }
  }
</script>