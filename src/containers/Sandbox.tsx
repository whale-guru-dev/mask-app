import React, { useEffect, useRef, useState } from "react"
import { Stage, Layer } from "react-konva"
import { Vector2d } from "konva/types/types"
import { not } from "ramda"
import styled from "styled-components"

import {
  CONTROLLER_ROTATION,
  CONTROLLER_SIZE,
  MASK_HEIGHT,
  MASK_WIDTH,
  RENDER_TIME,
  SCALE_FACTOR,
  STAGE_HEIGHT,
  STAGE_WIDTH,
} from "../helpers/const"

import { download, detectFace, loadModels } from "../helpers/utils"

import { slideUp } from "../core/GlobalStyles"

import { IconEdit, IconSave } from "../icons"
import Figure from "../components/Figure"
import Button, { ButtonColor, ButtonSize } from "../components/Button"

import Controller from "./Controller"

interface Props {
  file?: string
}
interface WrapperProps {
  preview?: string
}

const Sandbox: React.FC<Props> = ({ file }: Props) => {
  const stageRef = useRef<any>(null)

  const [coordinates, setCoordinates] = useState<Vector2d>({
    x: 250,
    y: 170,
  })
  const [edit, setEdit] = useState<boolean>(false)
  const [rotation, setRotation] = useState<number>(CONTROLLER_ROTATION)
  const [scale, setScale] = useState<Vector2d>({ x: CONTROLLER_SIZE, y: CONTROLLER_SIZE })

  const onDetect = async () => {
    try {
      const data = await detectFace(stageRef?.current?.content)
      setRotation(data.rotation)
      setCoordinates(data.coordinates)
    } catch (error) {}
  }

  const onEdit = () => {
    setEdit(not(edit))
  }

  const onScale = (scale: number) => {
    setScale({
      x: scale,
      y: scale,
    })
  }

  const onSave = () => {
    if (stageRef?.current) {
      download(stageRef.current.toDataURL())
    }
  }

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    if (file) {
      /** @todo refactor this */
      setTimeout(onDetect, RENDER_TIME)
    }
  }, [file])

  return (
    <Wrapper preview={file}>
      <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} ref={stageRef} className="stage">
        <Layer>
          <Figure fit src={file || "/static/images/default.png"} />
          <Figure
            draggable
            scale={scale}
            rotation={rotation}
            src="/static/images/stripe.svg"
            x={coordinates?.x}
            y={coordinates?.y}
            offsetX={MASK_WIDTH / SCALE_FACTOR}
            offsetY={MASK_HEIGHT / SCALE_FACTOR}
          />
        </Layer>
      </Stage>

      {file ? (
        <Actions>
          <Relative>
            {edit ? (
              <Controller
                rotation={rotation}
                scale={scale.x}
                onRotation={setRotation}
                onScale={onScale}
                onClose={onEdit}
              />
            ) : null}

            <Button $color={ButtonColor.Black} $size={ButtonSize.Md} onClick={onEdit}>
              <IconEdit />
              Edit effect
            </Button>
          </Relative>

          <Relative>
            <Button $color={ButtonColor.Red} $size={ButtonSize.Md} onClick={onSave}>
              <IconSave />
              Save photo
            </Button>
          </Relative>
        </Actions>
      ) : null}
    </Wrapper>
  )
}

const Wrapper = styled.div<WrapperProps>`
  position: relative;
  height: 100%;
  background-image: ${(props) => `url(${props.preview})` || "none"};
  background-size: cover;
  background-position: center;
  overflow: hidden;
  transform: translate3d(0, 0, 0);

  &:before {
    content: "";
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(18px);
  }

  .stage,
  .konvajs-content,
  canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }

  @media all and (max-width: 480px) {
    overflow: visible;
    transform: none;
  }
`

const Actions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;

  @media all and (max-width: 480px) {
    position: static;
  }
`

const Relative = styled.div`
  position: relative;
  width: 50%;

  ${Button} {
    width: 100%;
  }

  > ${Button} {
    transform: translate3d(0, 100%, 0);
    animation: 0.3s ${slideUp} forwards 1s ease;
  }

  &:last-child {
    > ${Button} {
      animation-delay: 1.1s;
    }
  }

  @media all and (max-width: 480px) {
    position: static;
    overflow: hidden;
  }
`

export default Sandbox
