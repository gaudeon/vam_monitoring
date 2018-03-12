<template>
<button type="button" id="" class="btn btn-info start" v-on:click="startStream">Start Camera</button>
 
<div class="row">
  <img src="{{ url }}" id="stream">
</div>
</template>

<script>
export default {
    created () {
        var socket = io();
        socket.on('liveStream', (url) => {
            this.url = url;
        });
    },
    methods: {
        startStream: (event) => {
            socket.emit('start-stream');
        }
    }
}
</script>

<style>
</style>
