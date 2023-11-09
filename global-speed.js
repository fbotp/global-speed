// ==UserScript==
// @name         视频播放速度控制脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  使用A、D、S、Z和X键来控制视频播放速度
// @author       rourou
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  let currentSpeed = 1.0 // 初始速度为1.0
  let preSpeed = 1.0 // 上次速度
  let speedActionTimer = null // 短时间内多次按键避免重复设置

  // 创建显示当前速度的信息框
  const speedDisplay = document.createElement('div')
  speedDisplay.style.position = 'fixed'
  speedDisplay.style.top = '10px'
  speedDisplay.style.left = '10px'
  speedDisplay.style.padding = '10px'
  speedDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
  speedDisplay.style.color = 'white'
  speedDisplay.style.zIndex = '9999'
  speedDisplay.style.display = 'none'
  speedDisplay.style.fontSize = '50px'
  speedDisplay.textContent = currentSpeed
  document.body.appendChild(speedDisplay)
  let speedDisplayTimer = null // 显示计时器

  // 限定上下界
  function clamp(min, max, value) {
    let clamped = value 
    if (min != null) {
      clamped = Math.max(min, clamped)
    }
    if (max != null) {
      clamped = Math.min(max, clamped)
    }
    return clamped 
  }

  // 显示倍速框
  function updateSpeedDisplay() {
    speedDisplay.style.display = 'block'
    speedDisplay.textContent = currentSpeed.toFixed(2)
    clearTimeout(speedDisplayTimer)
    speedDisplayTimer = setTimeout(() => {
      speedDisplay.style.display = 'none'
    }, 1000)
  }

  // 设置速度
  function setVideoSpeed() {
    clearTimeout(speedActionTimer)
    speedActionTimer = setTimeout( () => {
      const videos = document.getElementsByTagName('video')
      for (let video of videos) {
        try {
          video.playbackRate = currentSpeed
          video.defaultPlaybackRate = currentSpeed
        }
        catch (err) {}
      }
    }, 200)
  }

  // +/-速度
  function changeVideoSpeed(speedChange) {
    preSpeed = currentSpeed
    currentSpeed += speedChange
    currentSpeed = clamp(0.25, 20.00, currentSpeed)
    setVideoSpeed()
  }

  // 当前速度与1.0切换
  function toggleVideoSpeed() {
    if (currentSpeed !== 1) {
      preSpeed = currentSpeed
      currentSpeed = 1.0
    } else {
      currentSpeed = preSpeed
    }
    setVideoSpeed()
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || !['A', 'a', 'D', 'd', 'S', 's', 'Z', 'z', 'X', 'x'].includes(e.key) || ['input', 'textarea'].includes(e.target.tagName.toLowerCase())) {
      return
    }
    if (['A', 'a'].includes(e.key)) {
      changeVideoSpeed(-0.25) // 减速
    } else if (['D', 'd'].includes(e.key)) {
      changeVideoSpeed(0.25) // 加速
    } else if (['S', 's'].includes(e.key)) {
      toggleVideoSpeed() // 切换到1.0倍速或当前倍速
    } else if (['Z', 'z'].includes(e.key)) {
      const videos = document.getElementsByTagName('video')
      for (let video of videos) {
        video.currentTime -= 10 // 快退10秒
      }
    } else if (['X', 'x'].includes(e.key)) {
      const videos = document.getElementsByTagName('video')
      for (let video of videos) {
        video.currentTime += 10 // 快进10秒
      }
    }
    updateSpeedDisplay()
    e.stopPropagation()
  })
})()